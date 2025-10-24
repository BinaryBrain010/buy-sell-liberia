import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import connectDB from "@/lib/mongoose";
import BannerAd from "@/models/BannerAd";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/cron/cleanup-banner-ads
 * Deletes banner ads whose endsAt <= now and removes their local files if stored under /uploads
 * Secure with CRON_SECRET header in production similar to other cron endpoints
 */
export async function GET(req: NextRequest) {
  try {
    // Optional CRON_SECRET check
    const cronSecret = req.headers.get("x-cron-secret");
    const expected = process.env.CRON_SECRET;
    if (expected && cronSecret !== expected) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid cron secret." },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    const expiring = await BannerAd.find({ endsAt: { $lte: now } }).lean();

    if (!expiring.length) {
      return NextResponse.json({
        success: true,
        message: "No expired banner ads to delete",
        count: 0,
      });
    }

    const ids = expiring.map((d: any) => d._id);

    // Delete DB records first
    const delRes = await BannerAd.deleteMany({ _id: { $in: ids } });

    // Try to delete local files
    const deletedFiles: string[] = [];
    for (const doc of expiring) {
      const imageUrl = String(doc.imageUrl || "");
      if (imageUrl.startsWith("/uploads/")) {
        const rel = imageUrl.replace(/^\/+uploads\//, "");
        const abs = join(process.cwd(), "uploads", rel);
        try {
          if (existsSync(abs)) {
            await unlink(abs);
            deletedFiles.push(imageUrl);
          }
        } catch (e) {
          console.warn("[CRON][BANNER-ADS] Could not delete file:", abs, e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${delRes.deletedCount || 0} expired banner ads`,
      count: delRes.deletedCount || 0,
      deletedFiles,
      items: expiring.map((d: any) => ({
        id: d._id,
        endsAt: d.endsAt,
        imageUrl: d.imageUrl,
      })),
    });
  } catch (error: any) {
    console.error("[CRON][BANNER-ADS] Cleanup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to cleanup banner ads",
      },
      { status: 500 }
    );
  }
}

// POST variant for manual trigger
export async function POST(req: NextRequest) {
  return GET(req);
}
