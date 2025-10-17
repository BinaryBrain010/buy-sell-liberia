import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ensureModelsRegistered } from "@/lib/ensure-models";
import RevenueEntry from "@/models/RevenueEntry";
import WithdrawalLog from "@/models/WithdrawalLog";
import mongoose from "mongoose";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";

// POST /api/admin/revenue
// Body: { type: "expense"|"withdrawal", amount:number, currency?:string, note?:string, destination?:string, meta?:any }
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "No token" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Strict role gate using AdminAuthService
    const role = (payload as any).role;
    if (!AdminAuthService.isAllowedRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    ensureModelsRegistered();

    const body = await request.json();
    const { type, amount, currency, note, destination, meta } = body || {};
    if (!type || !["expense", "withdrawal"].includes(type)) {
      return NextResponse.json(
        { error: "type must be expense|withdrawal" },
        { status: 400 }
      );
    }
    if (typeof amount !== "number" || !(amount >= 0)) {
      return NextResponse.json(
        { error: "amount must be a non-negative number" },
        { status: 400 }
      );
    }

    const createdBy =
      (payload as any)._id &&
      mongoose.Types.ObjectId.isValid((payload as any)._id)
        ? new mongoose.Types.ObjectId((payload as any)._id)
        : undefined;

    // Create revenue record
    const rev = await RevenueEntry.create({
      type,
      amount,
      currency: currency || "LRD",
      note,
      source: "admin_panel",
      meta,
      createdBy,
    });

    // If withdrawal, also create a WithdrawalLog entry for bookkeeping
    let withdrawal: any = null;
    if (type === "withdrawal") {
      withdrawal = await WithdrawalLog.create({
        amount,
        date: new Date(),
        destination: destination || "account",
        note,
        admin: createdBy,
        adminTitle: String(role),
      });
    }

    return NextResponse.json({ ok: true, item: rev, withdrawal });
  } catch (error: any) {
    console.error("/api/admin/revenue POST error", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to create admin revenue entry",
      },
      { status: 500 }
    );
  }
}
