import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("x-menuFlow-platform", "menuflow");
  response.headers.set(
    "x-content-type-options",
    response.headers.get("x-content-type-options") ?? "nosniff"
  );
  response.headers.set(
    "referrer-policy",
    response.headers.get("referrer-policy") ?? "strict-origin-when-cross-origin"
  );

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Auth will be enforced once the admin auth flow is connected.
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
