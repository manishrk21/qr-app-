import { NextResponse } from "next/server";
import { failure, success } from "@/lib/api/response";
import { createRepositoryFromServer } from "@/lib/supabase-repository";
import { z } from "zod";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = z.object({ tableId: z.string().uuid() }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(failure("Invalid table ID.", "VALIDATION_ERROR"), {
        status: 400
      });
    }

    const repository = createRepositoryFromServer();
    const restaurant = await repository.getRestaurantBySlug(params.slug);

    if (!restaurant) {
      return NextResponse.json(failure("Restaurant not found.", "NOT_FOUND"), {
        status: 404
      });
    }

    const table = await repository.getTableById(parsed.data.tableId as any);
    if (!table) {
      return NextResponse.json(failure("Table not found.", "NOT_FOUND"), {
        status: 404
      });
    }

    return NextResponse.json(
      success({
        restaurantSlug: params.slug,
        restaurant,
        table
      })
    );
  } catch (error) {
    console.error("Table verify error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
