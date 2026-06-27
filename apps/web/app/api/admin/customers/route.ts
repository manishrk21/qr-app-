import { NextResponse } from "next/server";
import { success } from "@/lib/api/response";

export async function GET() {
  return NextResponse.json(
    success({
      customers: [
        {
          id: "cust_demo_1",
          name: "Demo Guest",
          mobileNumber: "+918888888888",
          visits: 7
        }
      ]
    })
  );
}
