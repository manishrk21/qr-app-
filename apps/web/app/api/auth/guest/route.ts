import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api/response";
import { restaurantSlugSchema } from "@/validations/auth";
import { getRestaurantBySlug } from "@/lib/demo-store";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = restaurantSlugSchema.safeParse(body?.restaurantSlug);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid guest session payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  const restaurant = getRestaurantBySlug(parsed.data);
  if (!restaurant) {
    return NextResponse.json(failure("Restaurant not found.", "NOT_FOUND"), {
      status: 404
    });
  }

  return NextResponse.json(
    success({
      customerSessionToken: `guest_${nanoid(16)}`,
      restaurantSlug: restaurant.slug,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  );
}
