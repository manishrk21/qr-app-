import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

const createOrderSchema = z.object({
  customerSessionToken: z.string().min(1),
  restaurantSlug: z.string().min(3),
  tableId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    return NextResponse.json(failure("Invalid order payload.", "VALIDATION_ERROR"), {
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

    // Verify session token
    const session = await repository.verifySessionToken(parsed.data.customerSessionToken);
    if (!session) {
      return NextResponse.json(failure("Invalid session token.", "UNAUTHORIZED"), {
        status: 401
      });
    }

    // Verify restaurant matches session
    if (session.restaurantId !== restaurant.id) {
      return NextResponse.json(failure("Restaurant mismatch.", "FORBIDDEN"), {
        status: 403
      });
    }

    // Create order
    const order = await repository.createOrder({
      restaurantId: restaurant.id,
      customerId: session.customerId,
      tableId: (parsed.data.tableId as any) ?? session.tableId ?? null,
      items: parsed.data.items as any,
      notes: parsed.data.notes
    });

    if (!order) {
      return NextResponse.json(failure("Unable to create order.", "ORDER_ERROR"), {
        status: 400
      });
    }

    return NextResponse.json(success(order), { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
