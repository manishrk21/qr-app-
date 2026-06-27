import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromServer } from "@/lib/supabase-repository";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const repository = createRepositoryFromServer();
    const catalog = await repository.getMenuCatalogByRestaurantSlug(params.slug);

    if (!catalog) {
      return NextResponse.json(
        failure("Menu not found.", "NOT_FOUND"),
        { status: 404 }
      );
    }

    return NextResponse.json(success(catalog));
  } catch (error) {
    console.error("Menu fetch error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
