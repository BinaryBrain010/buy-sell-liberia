import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import BumpPlan from "@/models/BumpPlan";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import {
  createAdminAuditLogger,
  extractUserInfoFromPayload,
} from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";

export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const plans = await BumpPlan.findActive();
    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch bump plans" },
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

    const {
      userId: adminUserId,
      role: adminRole,
      email: adminEmail,
      name: adminName,
    } = extractUserInfoFromPayload(payload);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const body = await request.json();
    if (!body.title || !body.bumps || typeof body.price === "undefined") {
      return NextResponse.json(
        { error: "title, bumps and price are required" },
        { status: 400 }
      );
    }

    const plan = new BumpPlan({
      title: body.title,
      bumps: Number(body.bumps),
      price: Number(body.price),
      currency: body.currency || "USD",
      description: body.description,
      priority: body.priority || 1,
      status: body.status || "active",
    });
    await plan.save();

    const logger = createAdminAuditLogger(
      request,
      adminUserId,
      adminRole,
      adminEmail,
      adminName
    );
    await logger.logCustomOperation(
      ModuleType.SETTINGS_MANAGEMENT,
      OperationType.MONETIZATION_PRICES_UPDATE,
      String(plan._id),
      "BumpPlan",
      {
        adminUserId,
        adminRole,
        adminEmail,
        adminName,
        bumpPlanTitle: plan.title,
        bumps: plan.bumps,
        price: plan.price,
      }
    );

    return NextResponse.json(
      { plan, message: "Bump plan created" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create bump plan" },
      { status: 500 }
    );
  }
}
