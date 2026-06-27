import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api/response";
import { mobileNumberSchema, restaurantSlugSchema } from "@/validations/auth";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { sendOTP } from "@/lib/sms/msg91";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limiter";
import { z } from "zod";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      restaurantSlug: restaurantSlugSchema,
      mobileNumber: mobileNumberSchema,
      tableId: z.string().uuid().optional()
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid OTP request payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  // Rate limit: 5 attempts per phone number per 10 minutes
  const phoneKey = `otp:${parsed.data.mobileNumber}`;
  const ipKey = `otp:ip:${getClientIp(request)}`;

  const phoneLimit = checkRateLimit(phoneKey, 5, 10 * 60 * 1000);
  const ipLimit = checkRateLimit(ipKey, 20, 10 * 60 * 1000); // Stricter per-phone limit

  if (!phoneLimit.allowed) {
    return NextResponse.json(
      failure(
        "Too many OTP requests for this phone number. Please try again later.",
        "RATE_LIMIT"
      ),
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((phoneLimit.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": phoneLimit.resetAt.toString()
        }
      }
    );
  }

  if (!ipLimit.allowed) {
    return NextResponse.json(
      failure(
        "Too many requests from your IP. Please try again later.",
        "RATE_LIMIT"
      ),
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((ipLimit.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": ipLimit.resetAt.toString()
        }
      }
    );
  }

  try {
    const repository = createRepositoryFromAdmin();

    // Get restaurant by slug
    const restaurant = await repository.getRestaurantBySlug(parsed.data.restaurantSlug);
    if (!restaurant) {
      return NextResponse.json(failure("Restaurant not found.", "NOT_FOUND"), {
        status: 404
      });
    }

    // Create OTP request in database
    const result = await repository.createOtpRequest({
      restaurantId: restaurant.id,
      mobileNumber: parsed.data.mobileNumber,
      tableId: (parsed.data.tableId as any) ?? null
    });

    if (!result) {
      return NextResponse.json(failure("Failed to create OTP request.", "OTP_ERROR"), {
        status: 500
      });
    }

    // Send OTP via MSG91
    const smsResult = await sendOTP(
      parsed.data.mobileNumber,
      result.otp,
      restaurant.name
    );

    if (!smsResult.success) {
      console.warn(`OTP SMS delivery failed: ${smsResult.error}`);
    }

    // Response
    const response: any = {
      otpRequestId: result.otpRequestId,
      mobileNumber: parsed.data.mobileNumber,
      expiresAt: result.expiresAt,
      delivery: smsResult.success ? "sms" : "fallback"
    };

    // Include OTP in development/fallback mode
    if (smsResult.otp) {
      response.demoOtp = smsResult.otp;
      response.note = "Development mode: OTP returned in response";
    }

    return NextResponse.json(success(response), {
      headers: {
        "X-RateLimit-Remaining": phoneLimit.remaining.toString(),
        "X-RateLimit-Reset": phoneLimit.resetAt.toString()
      }
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
