export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const apps = await VerificationApplication.find({ user: auth.userId }).sort(
      { createdAt: -1 }
    );
    return NextResponse.json({ success: true, applications: apps });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import VerificationApplication from "@/models/VerificationApplication";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const {
      type,
      governmentId,
      businessDocuments,
      phone,
      email,
      profilePicture,
      logo,
      businessAddress,
      socialLinks,
    } = body;
    // Validate required fields per type
    if (type === "individual") {
      if (!governmentId || !phone || !profilePicture) {
        return NextResponse.json(
          { error: "Missing required fields for individual" },
          { status: 400 }
        );
      }
    } else if (type === "business") {
      if (
        !governmentId ||
        !businessDocuments ||
        businessDocuments.length === 0 ||
        !phone ||
        !email
      ) {
        return NextResponse.json(
          { error: "Missing required fields for business" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid verification type" },
        { status: 400 }
      );
    }
    // Save application
    const app = await VerificationApplication.create({
      user: auth.userId,
      type,
      governmentId,
      businessDocuments,
      phone,
      email,
      profilePicture,
      logo,
      businessAddress,
      socialLinks,
      status: "pending",
    });
    return NextResponse.json({ success: true, applicationId: app._id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
