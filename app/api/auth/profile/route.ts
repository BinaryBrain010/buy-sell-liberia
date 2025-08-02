import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/app/api/modules/auth/middlewares/next-auth-middleware";
import { User } from "@/app/api/modules/auth/models/user.model";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const userPayload = requireAuth(req);
  if ((userPayload as any).error) return userPayload; // Unauthorized response

  // userPayload.userId is available from JWT
  const user = await User.findById((userPayload as any).userId).select("-password");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
} 