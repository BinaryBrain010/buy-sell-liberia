import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { ensureModelsRegistered } from "@/lib/ensure-models";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import ManualPayment from "@/models/ManualPayment";
import RevenueEntry from "@/models/RevenueEntry";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json(
        { ok: false, error: "No token" },
        { status: 401 }
      );
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object")
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    if (!AdminAuthService.isAllowedRole((payload as any).role))
      return NextResponse.json(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );

    await connectDB();
    ensureModelsRegistered();

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const filter: any = { status: "approved" };
    if (paymentId) filter._id = paymentId;
    if (from || to) {
      filter.reviewedAt = {};
      if (from) filter.reviewedAt.$gte = new Date(from);
      if (to) filter.reviewedAt.$lte = new Date(to);
    }

    const payments = await ManualPayment.find(filter).lean();
    let created = 0;
    let skipped = 0;
    const results: Array<{
      paymentId: string;
      action: string;
      revenueId?: string;
    }> = [];

    for (const p of payments) {
      const refId = String(p._id);
      const existing = await RevenueEntry.findOne({
        type: "income",
        source: "manual_payment",
        referenceId: refId,
      }).lean();
      if (existing) {
        skipped++;
        results.push({
          paymentId: refId,
          action: "exists",
          revenueId: String(existing._id),
        });
        continue;
      }
      const rev = await RevenueEntry.create({
        type: "income",
        amount: Number(p.amount || 0),
        currency: (p as any).currency || "LRD",
        source: "manual_payment",
        referenceId: refId,
        note: `Backfill income for approved manual payment (${p.featureType}:${p.featurePlan})`,
        meta: {
          featureType: p.featureType,
          featurePlan: p.featurePlan,
          featureDuration: p.featureDuration,
          bumpCredits: (p as any).bumpCredits ?? undefined,
          approvedAt: (p as any).reviewedAt || undefined,
        },
      });
      created++;
      results.push({
        paymentId: refId,
        action: "created",
        revenueId: String(rev._id),
      });
    }

    return NextResponse.json(
      { ok: true, created, skipped, total: payments.length, results },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("/api/admin/revenue/backfill POST error", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to backfill revenue" },
      { status: 500 }
    );
  }
}
