import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚫 Skip middleware for socket.io handshake & polling
  if (pathname.startsWith("/socket.io")) {
    return NextResponse.next();
  }

  // CORS: Allow requests from multiple origins
  const allowedOrigins = [
    "http://localhost:5173",
    "https://admin.buysellliberia.com",
    "https://buysellliberia.com"
  ];
  const origin = request.headers.get("origin");

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS,PATCH"
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

  // Check if the current path is protected
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get("accessToken");
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // DEBUG: Log all cookies
  console.log("Middleware cookies:", request.cookies);

  // Normal response, add CORS headers if origin matches
  const response = NextResponse.next();
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}
