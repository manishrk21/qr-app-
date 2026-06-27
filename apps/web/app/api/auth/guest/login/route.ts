import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { restaurantSlugSchema } from "@/validations/auth";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      restaurantSlug: restaurantSlugSchema,
      tableId: z.string().uuid().optional()
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid request.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const repository = createRepositoryFromAdmin();

    // Get restaurant
    const restaurant = await repository.getRestaurantBySlug(parsed.data.restaurantSlug);
    if (!restaurant) {
      return NextResponse.json(failure("Restaurant not found.", "NOT_FOUND"), {
        status: 404
      });
    }

    // Create guest customer (tableId will be stored in order, not customer)
    const guestPhone = `guest-${nanoid()}@temp`;
    const guestCustomer = await repository.getOrCreateCustomer({
      restaurantId: restaurant.id,
      mobileNumber: guestPhone,
      isGuest: true
    });

    if (!guestCustomer) {
      return NextResponse.json(
        failure("Failed to create guest session.", "GUEST_ERROR"),
        { status: 500 }
      );
    }

    // Create session
    const sessionResult = await repository.createCustomerSession({
      customerId: guestCustomer.id,
      restaurantId: restaurant.id,
      tableId: parsed.data.tableId ?? null,
      isGuest: true
    });

    if (!sessionResult) {
      return NextResponse.json(
        failure("Failed to create session.", "SESSION_ERROR"),
        { status: 500 }
      );
    }

    // Response - similar to OTP verify but for guest
    return NextResponse.json(
      success({
        customerId: guestCustomer.id,
        sessionToken: sessionResult.sessionToken,
        expiresAt: sessionResult.expiresAt,
        isGuest: true,
        message: "Guest session created successfully"
      })
    );
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      failure("Internal server error.", "SERVER_ERROR"),
      { status: 500 }
    );
  }
}
