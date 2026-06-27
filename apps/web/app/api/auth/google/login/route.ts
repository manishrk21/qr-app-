import { NextResponse } from "next/server";
import { success, failure } from "@/lib/api/response";
import { getGoogleAuthUrl } from "@/lib/auth/google-oauth";
import { z } from "zod";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      restaurantSlug: z.string(),
      redirectUrl: z.string().url()
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(failure("Invalid request.", "VALIDATION_ERROR"), {
      status: 400
    });
  }

  try {
    const googleUrl = await getGoogleAuthUrl({
      redirectTo: parsed.data.redirectUrl
    });

    if (!googleUrl) {
      return NextResponse.json(
        failure("Unable to initiate Google login.", "AUTH_ERROR"),
        { status: 500 }
      );
    }

    return NextResponse.json(success({ authUrl: googleUrl }));
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json(
      failure("Internal server error.", "SERVER_ERROR"),
      { status: 500 }
    );
  }
}
