import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Announcement from "@/models/Announcement";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import { createAdminAuditLogger, extractUserInfoFromPayload } from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";

// To test real-time sockets:
// 1. Open a socket connection to ws://localhost:3001 (or your socket server)
// 2. Listen for the 'announcement:new' event
// 3. When you send an announcement (via /send), you should receive the full announcement object in real time

export async function GET(request: NextRequest) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const total = await Announcement.countDocuments(filter);
    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    // Return all details for each announcement
    return NextResponse.json({
      announcements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { userId: adminUserId, role: adminRole, email: adminEmail, name: adminName } = extractUserInfoFromPayload(payload);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const body = await request.json();
    if (
      !body.title ||
      !body.content ||
      !body.type ||
      !Array.isArray(body.type) ||
      body.type.length === 0
    ) {
      return NextResponse.json(
        { error: "title, content, and at least one type are required" },
        { status: 400 }
      );
    }
    const announcement = new Announcement({
      title: body.title,
      content: body.content,
      type: body.type,
      status: body.status || "draft",
      scheduledAt: body.scheduledAt,
      expiresAt: body.expiresAt,
      targetAudience: body.targetAudience,
    });
    await announcement.save();

    // Create audit logger and log announcement creation
    const logger = createAdminAuditLogger(request, adminUserId, adminRole, adminEmail, adminName);
    await logger.logCustomOperation(ModuleType.ANNOUNCEMENT_MANAGEMENT, OperationType.ANNOUNCEMENT_CREATE, announcement._id.toString(), 'Announcement', {
      adminUserId,
      adminRole,
      adminEmail,
      adminName,
      announcementTitle: announcement.title,
      announcementType: announcement.type,
      announcementStatus: announcement.status,
      targetAudience: announcement.targetAudience,
      summary: `Created announcement: ${announcement.title} (${announcement.type.join(', ')}) by ${adminName} (${adminRole})`
    });

    return NextResponse.json(
      { announcement, message: "Announcement created" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create announcement" },
      { status: 500 }
    );
  }
}
