import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import VerificationApplication from "@/models/VerificationApplication";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import dbConnect from "@/lib/mongoose";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";
export async function GET(request: NextRequest) {
  try {
    // Admin token check
    const authHeader = request.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "No token" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    let query = {};
    if (userId) {
      query = { user: userId };
    }
    const apps = await VerificationApplication.find(query).sort({
      createdAt: -1,
    });
    return NextResponse.json({ success: true, applications: apps });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
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
