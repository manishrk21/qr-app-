import { NextResponse } from "next/server";

export function notImplemented(message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        message,
        code: "NOT_IMPLEMENTED"
      }
    },
    { status: 501 }
  );
}
