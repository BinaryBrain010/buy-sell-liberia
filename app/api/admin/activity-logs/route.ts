import { NextRequest, NextResponse } from "next/server";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import dbConnect from "@/lib/mongoose";
import { ensureModelsRegistered } from "@/lib/ensure-models";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import { Admin } from "../../modules/auth/models/admin.model";
import { Types } from "mongoose";
import crypto from "crypto";

// Helper function to generate deterministic ObjectId from any string
function generateObjectIdFromUser(userId: string | Types.ObjectId): Types.ObjectId {
  if (Types.ObjectId.isValid(userId)) {
    return new Types.ObjectId(userId);
  } else {
    // For non-ObjectId user IDs, create a deterministic ObjectId based on the user identifier
    const userString = String(userId);
    const hash = crypto.createHash('md5').update(userString).digest('hex');
    const objectIdString = hash.substring(0, 24);
    return new Types.ObjectId(objectIdString);
  }
}

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
    const processedLogs = await Promise.all(logs.map(async (log) => {
      if (!log.user || typeof log.user === "string") {
        // If user doesn't exist or is a string, try to extract from details
        const details = JSON.parse(log.details || "{}");
        const originalUserId = details.originalUserId || "unknown";

        // Try to find admin by ID or email
        let adminName = "Admin User";
        let adminEmail = "admin@system";
        let adminRole = "admin";

        try {
          // Try to find admin by ID first
          if (originalUserId && originalUserId !== "unknown") {
            const admin = await Admin.findOne({ 
              $or: [
                { _id: originalUserId },
                { email: originalUserId }
              ]
            });
            
            if (admin) {
              adminName = admin.name || admin.email.split('@')[0];
              adminEmail = admin.email;
              adminRole = admin.role;
            } else if (originalUserId.includes("@")) {
              // If it's an email, use it directly
              adminEmail = originalUserId;
              adminName = originalUserId
                .split("@")[0]
                .replace(/[._-]/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase());
            }
          }
        } catch (error) {
          console.error("Error finding admin:", error);
          // Fallback to original logic
          if (originalUserId.includes("@")) {
            adminEmail = originalUserId;
            adminName = originalUserId
              .split("@")[0]
              .replace(/[._-]/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase());
          }
        }

        return {
          ...log.toObject(),
          user: {
            _id: generateObjectIdFromUser(log.user || "unknown"),
            fullName: adminName,
            email: adminEmail,
            role: adminRole,
          },
        };
      }
      return log;
    }));

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
