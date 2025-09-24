import { NextRequest, NextResponse } from "next/server";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import dbConnect from "@/lib/mongoose";
import { ensureModelsRegistered } from "@/lib/ensure-models";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";

// GET: List activity logs, filterable by user or action
export async function GET(req: NextRequest) {
  try {
    // Auth: Only super_admin can access activity logs
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      payload.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden - Super Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Ensure all models are registered
    ensureModelsRegistered();

    const { searchParams } = new URL(req.url!);
    const user = searchParams.get("user");
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (user) {
      // Search by user email or name
      filter.$or = [
        { "user.email": { $regex: user, $options: "i" } },
        { "user.fullName": { $regex: user, $options: "i" } },
      ];
    }
    if (action) filter.action = { $regex: action, $options: "i" };

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("user", "fullName email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter),
    ]);

    // Process logs to handle cases where user might not exist (admin users)
    const processedLogs = logs.map((log) => {
      if (!log.user || typeof log.user === "string") {
        // If user doesn't exist or is a string, try to extract from details
        const details = JSON.parse(log.details || "{}");
        const originalUserId = details.originalUserId || "Unknown Admin";

        // Extract admin info from originalUserId
        let adminName = "Admin User";
        let adminEmail = "admin@system";

        if (originalUserId.includes("@")) {
          adminEmail = originalUserId;
          adminName = originalUserId
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
        } else if (originalUserId.startsWith("admin-")) {
          const parts = originalUserId.split("-");
          if (parts.length >= 2) {
            adminEmail = parts[1].includes("@")
              ? parts[1]
              : `${parts[1]}@admin.system`;
            adminName = parts[1]
              .replace(/[._-]/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase());
          }
        }

        return {
          ...log.toObject(),
          user: {
            _id: log.user || "unknown",
            fullName: adminName,
            email: adminEmail,
            role: "admin",
          },
        };
      }
      return log;
    });

    return NextResponse.json({
      logs: processedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
