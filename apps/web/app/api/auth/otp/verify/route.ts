import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api/response";
import { mobileNumberSchema, otpSchema, restaurantSlugSchema } from "@/validations/auth";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      restaurantSlug: restaurantSlugSchema,
      mobileNumber: mobileNumberSchema,
      otp: otpSchema,
      tableId: z.string().uuid().optional()
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid OTP verification payload.", "VALIDATION_ERROR"), {
      status: 400
    });
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

    // Verify OTP
    const otpRequestId = await repository.verifyOtpRequest({
      restaurantId: restaurant.id,
      mobileNumber: parsed.data.mobileNumber,
      otp: parsed.data.otp
    });

    if (!otpRequestId) {
      return NextResponse.json(
        failure("OTP verification failed.", "OTP_INVALID"),
        { status: 401 }
      );
    }

    // Get or create customer
    const customer = await repository.getOrCreateCustomer({
      restaurantId: restaurant.id,
      mobileNumber: parsed.data.mobileNumber,
      isGuest: true
    });

    if (!customer) {
      return NextResponse.json(failure("Failed to create customer.", "CUSTOMER_ERROR"), {
        status: 500
      });
    }

    // Create session
    const session = await repository.createCustomerSession({
      customerId: customer.id,
      restaurantId: restaurant.id,
      tableId: (parsed.data.tableId as any) ?? null,
      isGuest: true
    });

    if (!session) {
      return NextResponse.json(failure("Failed to create session.", "SESSION_ERROR"), {
        status: 500
      });
    }

    return NextResponse.json(
      success({
        customerSessionToken: session.sessionToken,
        customer: {
          id: customer.id,
          mobileNumber: customer.mobileNumber,
          name: customer.name,
          isGuest: customer.isGuest
        },
        tableId: parsed.data.tableId ?? null
      })
    );
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
