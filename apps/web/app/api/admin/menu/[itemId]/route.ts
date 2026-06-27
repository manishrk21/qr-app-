import { NextResponse } from "next/server";
import { success } from "@/lib/api/response";

import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
  foodType: z.enum(["veg", "non_veg", "egg"]).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  allergens: z.array(z.string()).optional(),
  preparationTimeMinutes: z.number().int().nullable().optional()
});

export async function PUT(request: Request, { params }: { params: { itemId: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = updateMenuItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid menu item update payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const repository = createRepositoryFromAdmin();
    const item = await repository.updateMenuItem(params.itemId as any, parsed.data);

    if (!item) {
      return NextResponse.json(failure("Failed to update menu item.", "UPDATE_ERROR"), {
        status: 500
      });
    }

    return NextResponse.json(success(item));
  } catch (error) {
    console.error("Menu item update error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}

export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const repository = createRepositoryFromAdmin();
    const deleted = await repository.deleteMenuItem(params.itemId as any);

    if (!deleted) {
      return NextResponse.json(failure("Failed to delete menu item.", "DELETE_ERROR"), {
        status: 500
      });
    }

    return NextResponse.json(success({ deleted: true }));
  } catch (error) {
    console.error("Menu item delete error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
