import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { createRepositoryFromAdmin } from "@/lib/supabase-repository";
import { z } from "zod";

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "paid",
    "preparing",
    "ready",
    "served",
    "completed",
    "cancel_requested",
    "cancelled"
  ])
});

export async function PUT(request: Request, { params }: { params: { orderId: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = updateOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid order status payload.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const repository = createRepositoryFromAdmin();
    const order = await repository.updateOrderStatus(params.orderId as any, parsed.data.status);

    if (!order) {
      return NextResponse.json(failure("Order status update failed.", "ORDER_UPDATE_FAILED"), {
        status: 500
      });
    }

    return NextResponse.json(success(order));
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(failure("Internal server error.", "SERVER_ERROR"), {
      status: 500
    });
  }
}
