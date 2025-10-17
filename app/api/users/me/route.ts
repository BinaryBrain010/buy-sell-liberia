import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const user = await User.findById(auth.userId).select(
      "fullName username email phone profile preferences activity emailVerified phoneVerified bumpCount"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      bumpCount: (user as any).bumpCount ?? 0,
      profile: user.profile,
      preferences: user.preferences,
      activity: user.activity,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: 500 }
    );
  }
}
