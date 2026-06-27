import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

const createTableSchema = z.object({
  restaurantId: z.string().uuid(),
  label: z.string().min(1),
  capacity: z.number().int().positive().optional(),
  shortCode: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createTableSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid table payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const repository = createRepositoryFromAdmin();
    const table = await repository.createTable(parsed.data);

    if (!table) {
      return NextResponse.json(failure("Failed to create table.", "CREATE_ERROR"), {
        status: 500
      });
    }

    return NextResponse.json(success(table), { status: 201 });
  } catch (error) {
    console.error("Table create error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
