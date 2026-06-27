import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

const createCategorySchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid category payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const repository = createRepositoryFromAdmin();
    const category = await repository.createCategory(parsed.data);

    if (!category) {
      return NextResponse.json(failure("Failed to create category.", "CREATE_ERROR"), {
        status: 500
      });
    }

    return NextResponse.json(success(category), { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
