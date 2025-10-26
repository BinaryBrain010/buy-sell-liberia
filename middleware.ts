import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚫 Skip middleware for socket.io handshake & polling
  if (pathname.startsWith("/socket.io")) {
    return NextResponse.next();
  }

  // CORS: Allow requests from admin panel origin
  // const allowedOrigin = "https://admin.buysellliberia.com";
  const allowedOrigin = "http://localhost:5173";
  const origin = request.headers.get("origin");

  // Handle CORS preflight ASAP
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
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

  // Maintenance mode: only allow essential assets and the maintenance page to load
  const maintenanceBypass =
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/api/settings/maintenance");

  if (!maintenanceBypass) {
    try {
      const url = new URL("/api/settings/maintenance", request.url);
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { maintenance?: boolean };
        if (data?.maintenance) {
          // Redirect everything to /maintenance when enabled
          return NextResponse.redirect(new URL("/maintenance", request.url));
        }
      }
    } catch (e) {
      console.warn(
        "[Middleware] Maintenance check failed:",
        (e as any)?.message || e
      );
      // On error, continue normal flow
    }
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
  if (origin === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}
