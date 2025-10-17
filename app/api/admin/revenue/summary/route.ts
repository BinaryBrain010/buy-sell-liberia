import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ManualPayment from "@/models/ManualPayment";
import Product from "@/models/Product";
import RevenueEntry from "@/models/RevenueEntry";
import { AdminAuthService } from "../../../modules/auth/services/admin-auth.service";
import { connectDB } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Admin auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Centralized role authorization (allows any configured admin/employee role)
    if (!AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse date range
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : null;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : null;

    // Build query
    const query: any = { status: "approved" };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    // Aggregate payments (legacy total revenue for approved manual payments)
    const payments = await ManualPayment.find(query).populate("listing");

    // Total revenue
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Breakdown by payment method
    const breakdownByPaymentMethod: Record<string, number> = {};
    payments.forEach((p) => {
      const methodKey = (p.method || "unknown") as string;
      breakdownByPaymentMethod[methodKey] =
        (breakdownByPaymentMethod[methodKey] || 0) + (p.amount ?? 0);
    });

    // Breakdown by feature type (Boosts = featured listing, Other = not featured)
    const breakdownByFeatureType: Record<string, number> = {
      Boosts: 0,
      Other: 0,
    };
    payments.forEach((p) => {
      const product = p.listing as any;
      if (product && product.featured) {
        breakdownByFeatureType.Boosts += p.amount || 0;
      } else {
        breakdownByFeatureType.Other += p.amount || 0;
      }
    });

    // Revenue-based net totals (income - expense - withdrawal), grouped by currency
    const revMatch: any = {};
    if (startDate || endDate) {
      revMatch.createdAt = {};
      if (startDate) revMatch.createdAt.$gte = startDate;
      if (endDate) revMatch.createdAt.$lte = endDate;
    }
    const rows = await RevenueEntry.aggregate([
      { $match: revMatch },
      {
        $group: {
          _id: { currency: "$currency", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalsByCurrency: Record<
      string,
      { income: number; expense: number; withdrawal: number; net: number }
    > = {};
    for (const r of rows) {
      const cur = r._id.currency || "LRD";
      const t = r._id.type as "income" | "expense" | "withdrawal";
      totalsByCurrency[cur] ||= {
        income: 0,
        expense: 0,
        withdrawal: 0,
        net: 0,
      };
      totalsByCurrency[cur][t] += r.total || 0;
    }
    for (const cur of Object.keys(totalsByCurrency)) {
      const s = totalsByCurrency[cur];
      s.net = (s.income || 0) - (s.expense || 0) - (s.withdrawal || 0);
    }

    return NextResponse.json(
      {
        totalRevenue,
        breakdownByPaymentMethod,
        breakdownByFeatureType,
        totalsByCurrency, // includes net per currency from RevenueEntry
        payments: payments.map((p) => ({
          _id: p._id,
          amount: p.amount,
          method: p.method,
          createdAt: p.createdAt,
          listing: p.listing?._id,
          featured: (p.listing as any)?.featured || false,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("Error in /api/admin/revenue/summary GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
