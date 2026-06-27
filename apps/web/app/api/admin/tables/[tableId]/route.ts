import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

const updateTableSchema = z.object({
  isActive: z.boolean().optional(),
  label: z.string().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  shortCode: z.string().optional()
});

export async function PUT(request: Request, { params }: { params: { tableId: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = updateTableSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid table update payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const repository = createRepositoryFromAdmin();
    const table = await repository.updateTableStatus(params.tableId as any, parsed.data.isActive ?? true);

    if (!table) {
      return NextResponse.json(failure("Failed to update table.", "UPDATE_ERROR"), {
        status: 500
      });
    }

    return NextResponse.json(success(table));
  } catch (error) {
    console.error("Table update error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}

export async function DELETE() {
  return NextResponse.json(success({ deleted: true }));
}
