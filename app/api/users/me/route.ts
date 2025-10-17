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
      "fullName username email phone profile preferences activity emailVerified phoneVerified bumpCount verificationPaidAt verificationPaidUntil"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const now = new Date();
    const paidActive =
      (user as any).verificationPaidUntil &&
      (user as any).verificationPaidUntil > now;
    const isVerified =
      user.profile?.verificationStatus === "fully_verified" || paidActive;
    const res = NextResponse.json({
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
      isVerified,
      verificationPaidAt: (user as any).verificationPaidAt || null,
      verificationPaidUntil: (user as any).verificationPaidUntil || null,
    });
    // Avoid caching so UI reflects verification and other critical flags immediately
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: 500 }
    );
  }
}
