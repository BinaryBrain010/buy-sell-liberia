import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedPaths = ["/dashboard", "/sell"];
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // Check for the correct cookie name (accessToken)
    const token = request.cookies.get("accessToken");
    if (!token) {
      // Redirect to home if not authenticated
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // DEBUG: Log all cookies to help diagnose auth issues
  console.log("Middleware cookies:", request.cookies);

  return NextResponse.next();
}

// Apply middleware only to dashboard and sell routes
export const config = {
  matcher: ["/dashboard/:path*", "/sell/:path*"],
};
