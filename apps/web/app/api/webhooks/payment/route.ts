import { NextResponse } from "next/server";
import { success } from "@/lib/api/response";

export async function POST() {
  return NextResponse.json(success({ received: true }));
}
