import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromServer } from "@/lib/supabase-repository";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const repository = createRepositoryFromServer();
    const restaurant = await repository.getRestaurantBySlug(params.slug);

    if (!restaurant) {
      return NextResponse.json(
        failure("Restaurant not found.", "NOT_FOUND"),
        { status: 404 }
      );
    }

    return NextResponse.json(success({ restaurant }));
  } catch (error) {
    console.error("Restaurant fetch error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
