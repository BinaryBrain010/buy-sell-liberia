import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // CORS: Allow requests from http://localhost:5173
  const allowedOrigin = "http://localhost:5173";
  const origin = request.headers.get("origin");

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

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

  // Normal response, add CORS headers if origin matches
  const response = NextResponse.next();
  if (origin === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

// Middleware now applies globally (no matcher)
