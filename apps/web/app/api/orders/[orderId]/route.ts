import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";

export async function GET(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const repository = createRepositoryFromAdmin();
    const order = await repository.getOrderById(params.orderId as any);

    if (!order) {
      return NextResponse.json(failure("Order not found.", "NOT_FOUND"), {
        status: 404
      });
    }

    return NextResponse.json(success(order));
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
