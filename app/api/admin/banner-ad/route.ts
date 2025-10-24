import { NextRequest, NextResponse } from "next/server";
import { parseFiles, validateFiles } from "@/lib/multer";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import connectDB from "@/lib/mongoose";
import BannerAd from "@/models/BannerAd";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Public – list banner images only (no placement/target/active/dates in response)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Always return all banners, newest first
    const docs = await BannerAd.find({}).sort({ createdAt: -1 }).lean();
    const items = docs.map((d: any) => ({
      id: String(d._id),
      imageUrl: d.imageUrl,
    }));

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error: any) {
    console.error("[ADMIN/BANNER-AD][GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch banner ads" },
      { status: 500 }
    );
  }
}

// POST: Admin only – upload one or multiple banner images and create entries
export async function POST(req: NextRequest) {
  try {
    // Basic admin authorization via bearer token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload: any = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole(payload.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse multipart form data (uses our multer helpers)
    const { files, fields } = await parseFiles(req);
    const { valid, errors } = validateFiles(files);
    if (!valid) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    // Only support duration days (optional). No placement/target/isActive inputs.
    const now = new Date();
    const startsAt = now; // internal use; not returned in API
    let endsAt: Date | null = null;
    const daysRaw = fields.days ?? fields.durationDays ?? fields.duration_days;
    if (daysRaw !== undefined) {
      const daysNum = Number(daysRaw);
      if (Number.isFinite(daysNum) && daysNum > 0) {
        endsAt = new Date(startsAt.getTime() + daysNum * 24 * 60 * 60 * 1000);
      }
    }

    // Prepare upload dir: /uploads/banners
    const baseUploads = join(process.cwd(), "uploads");
    const bannersDir = join(baseUploads, "banners");
    if (!existsSync(bannersDir)) {
      await mkdir(bannersDir, { recursive: true });
    }

    await connectDB();

    const created: any[] = [];
    // Save files to disk and create DB records
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ts = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const filename = `${ts}_${i}_${safeName}`;
      const filePath = join(bannersDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filePath, buffer);

      // Public URL path for the uploaded file (served by /uploads/* route)
      const imageUrl = `/uploads/banners/${filename}`;

      // Model requires placement and targetUrl, but we don't expose them via API.
      const doc = await BannerAd.create({
        imageUrl,
        targetUrl: imageUrl, // default internally
        placement: "global", // default internally
        isActive: true,
        startsAt,
        endsAt,
      });
      created.push(doc);
    }

    return NextResponse.json({
      success: true,
      createdCount: created.length,
      items: created,
    });
  } catch (error: any) {
    console.error("[ADMIN/BANNER-AD][POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to upload banner images",
      },
      { status: 500 }
    );
  }
}

// DELETE: Admin only – delete one or multiple banner ads and their local files
export async function DELETE(req: NextRequest) {
  try {
    // Auth check (admin roles only)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload: any = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole(payload.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const qpId = url.searchParams.get("id");

    let ids: string[] = [];
    if (qpId) {
      ids = [qpId];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body?.ids)) ids = body.ids.map(String);
        else if (body?.id) ids = [String(body.id)];
      } catch {}
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Provide id query param or JSON body { id } or { ids: [] }" },
        { status: 400 }
      );
    }

    await connectDB();

    const found = await BannerAd.find({ _id: { $in: ids } }).lean();
    const foundIds = new Set(found.map((d: any) => String(d._id)));
    const notFoundIds = ids.filter((id) => !foundIds.has(String(id)));

    // Delete DB records first
    const delRes = await BannerAd.deleteMany({ _id: { $in: ids } });

    // Attempt to delete local files for records that pointed to /uploads/
    const deletedFiles: string[] = [];
    for (const doc of found) {
      const imageUrl = String(doc.imageUrl || "");
      if (imageUrl.startsWith("/uploads/")) {
        // Map URL /uploads/banners/xyz -> <cwd>/uploads/banners/xyz
        const rel = imageUrl.replace(/^\/+uploads\//, "");
        const abs = join(process.cwd(), "uploads", rel);
        try {
          if (existsSync(abs)) {
            await unlink(abs);
            deletedFiles.push(imageUrl);
          }
        } catch (e) {
          // Ignore individual file deletion errors
          console.warn(
            "[ADMIN/BANNER-AD][DELETE] Could not delete file:",
            abs,
            e
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: delRes.deletedCount || 0,
      deletedIds: Array.from(foundIds),
      notFoundIds,
      deletedFiles,
    });
  } catch (error: any) {
    console.error("[ADMIN/BANNER-AD][DELETE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete banner ads",
      },
      { status: 500 }
    );
  }
}
