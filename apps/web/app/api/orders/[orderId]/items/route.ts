import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api/response";
import { appendItemsToDemoOrder, getDemoOrder } from "@/lib/demo-store";
import { z } from "zod";

const addItemsSchema = z.object({
  restaurantSlug: z.string().min(3),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const existing = getDemoOrder(params.orderId);
  if (!existing) {
    return NextResponse.json(failure("Order not found.", "NOT_FOUND"), {
      status: 404
    });
  }

  const body = await request.json().catch(() => null);
  const parsed = addItemsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(failure("Invalid order item payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  let order: ReturnType<typeof appendItemsToDemoOrder> = null;
  try {
    order = appendItemsToDemoOrder({
      orderId: existing.id,
      restaurantSlug: parsed.data.restaurantSlug,
      items: parsed.data.items
    });
  } catch (error) {
    return NextResponse.json(
      failure(
        error instanceof Error ? error.message : "Unable to add order items.",
        "ORDER_ERROR"
      ),
      { status: 400 }
    );
  }

  if (!order) {
    return NextResponse.json(failure("Unable to add order items.", "ORDER_ERROR"), {
      status: 400
    });
  }

  return NextResponse.json(success(order));
}
