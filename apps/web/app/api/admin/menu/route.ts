import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

const createMenuItemSchema = z.object({
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
  foodType: z.enum(["veg", "non_veg", "egg"]),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  allergens: z.array(z.string()).optional(),
  preparationTimeMinutes: z.number().int().nullable().optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createMenuItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid menu item payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const repository = createRepositoryFromAdmin();
    const item = await repository.createMenuItem(parsed.data);

    if (!item) {
      return NextResponse.json(failure("Failed to create menu item.", "CREATE_ERROR"), {
        status: 500
      });
    }

    return NextResponse.json(success(item), { status: 201 });
  } catch (error) {
    console.error("Menu item create error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
