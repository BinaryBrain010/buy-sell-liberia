import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ensureModelsRegistered } from "@/lib/ensure-models";
import RevenueEntry from "@/models/RevenueEntry";
import mongoose from "mongoose";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";

// GET /api/revenue
// - List entries (with pagination & filters)
// - Stats mode: /api/revenue?stats=true[&from=ISO&to=ISO][&currency=LRD]
export async function GET(req: NextRequest) {
  try {
    // Admin/Employee auth only
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (!AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    ensureModelsRegistered();

    const { searchParams } = new URL(req.url);
    const isStats = ["1", "true", "yes"].includes(
      (searchParams.get("stats") || "").toLowerCase()
    );

    if (isStats) {
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const currency = searchParams.get("currency") || undefined;
      const match: any = {};
      if (from || to) {
        match.createdAt = {};
        if (from) match.createdAt.$gte = new Date(from);
        if (to) match.createdAt.$lte = new Date(to);
      }
      if (currency) match.currency = currency;

      const rows = await RevenueEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: { currency: "$currency", type: "$type" },
            total: { $sum: "$amount" },
          },
        },
      ]);

      const map: Record<
        string,
        { income: number; expense: number; withdrawal: number; net: number }
      > = {};
      for (const r of rows) {
        const cur = r._id.currency || "LRD";
        const t = r._id.type as "income" | "expense" | "withdrawal";
        map[cur] ||= { income: 0, expense: 0, withdrawal: 0, net: 0 };
        map[cur][t] += r.total || 0;
      }
      for (const cur of Object.keys(map)) {
        const s = map[cur];
        s.net = (s.income || 0) - (s.expense || 0) - (s.withdrawal || 0);
      }

      return NextResponse.json(
        { ok: true, totalsByCurrency: map },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1),
      100
    );
    const type = searchParams.get("type") || undefined;
    const currency = searchParams.get("currency") || undefined;
    const source = searchParams.get("source") || undefined;
    const referenceId = searchParams.get("referenceId") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const filter: any = {};
    if (type) filter.type = type;
    if (currency) filter.currency = currency;
    if (source) filter.source = source;
    if (referenceId) filter.referenceId = referenceId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      RevenueEntry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      RevenueEntry.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        ok: true,
        items,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("/api/revenue GET error", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to fetch revenue" },
      { status: 500 }
    );
  }
}

// POST /api/revenue
// Creates a revenue entry (income | expense | withdrawal)
export async function POST(req: NextRequest) {
  try {
    // Admin/Employee auth only
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { ok: false, error: "No token" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    if (!AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    await connectDB();
    ensureModelsRegistered();

    const body = await req.json();
    const {
      type,
      amount,
      currency,
      source,
      referenceId,
      note,
      meta,
      createdBy,
    } = body || {};
    if (!type || !["income", "expense", "withdrawal"].includes(type)) {
      return NextResponse.json(
        { ok: false, error: "type must be income|expense|withdrawal" },
        { status: 400 }
      );
    }
    if (typeof amount !== "number" || !(amount >= 0)) {
      return NextResponse.json(
        { ok: false, error: "amount must be a non-negative number" },
        { status: 400 }
      );
    }

    const doc = await RevenueEntry.create({
      type,
      amount,
      currency: currency || "LRD",
      source,
      referenceId,
      note,
      meta,
      createdBy:
        (payload as any)._id &&
        mongoose.Types.ObjectId.isValid((payload as any)._id)
          ? new mongoose.Types.ObjectId((payload as any)._id)
          : createdBy && mongoose.Types.ObjectId.isValid(createdBy)
          ? new mongoose.Types.ObjectId(createdBy)
          : undefined,
    });

    return NextResponse.json({ ok: true, item: doc }, { status: 201 });
  } catch (error: any) {
    console.error("/api/revenue POST error", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to create revenue entry" },
      { status: 500 }
    );
  }
}
