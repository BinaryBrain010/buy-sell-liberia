import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(new URL("/faq", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
