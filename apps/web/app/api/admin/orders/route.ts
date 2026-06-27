import { NextResponse } from "next/server";
import { success } from "@/lib/api/response";

export async function GET() {
  return NextResponse.json(
    success({
      orders: [
        {
          id: "ord_demo_1",
          status: "preparing",
          totalAmount: 280,
          createdAt: new Date().toISOString()
        }
      ]
    })
  );
}
