import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Convert uppercase paths to lowercase
  if (path !== path.toLowerCase()) {
    return NextResponse.redirect(new URL(path.toLowerCase(), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/thankyou"],
};
