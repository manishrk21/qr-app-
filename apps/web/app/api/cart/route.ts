import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api/response";
import { getMenuCatalogBySlug, calculateOrderTotals } from "@/lib/demo-store";
import { z } from "zod";

const cartSchema = z.object({
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid cart payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  const catalog = getMenuCatalogBySlug(parsed.data.restaurantSlug);
  if (!catalog) {
    return NextResponse.json(failure("Restaurant not found.", "NOT_FOUND"), {
      status: 404
    });
  }

  try {
    const totals = calculateOrderTotals(
      parsed.data.items.map((item) => {
        const menuItem = catalog.items.find(
          (entry) => entry.id === item.menuItemId
        );
        if (!menuItem) {
          throw new Error(`Unknown menu item: ${item.menuItemId}`);
        }

        return {
          quantity: item.quantity,
          unitPrice: menuItem.price
        };
      })
    );

    return NextResponse.json(
      success({
        restaurantSlug: parsed.data.restaurantSlug,
        itemCount: parsed.data.items.reduce((sum, item) => sum + item.quantity, 0),
        ...totals
      })
    );
  } catch (error) {
    return NextResponse.json(
      failure(
        error instanceof Error ? error.message : "Unable to validate cart.",
        "CART_ERROR"
      ),
      { status: 400 }
    );
  }
}
