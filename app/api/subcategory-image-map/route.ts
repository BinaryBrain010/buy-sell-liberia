import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mongoose from "mongoose";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import SubcategoryImageMap from "@/models/SubcategoryImageMap";

export const dynamic = "force-dynamic";

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/buysell",
      {
        serverSelectionTimeoutMS: 5000,
      }
    );
  }
}

function requireSuperAdmin(request: NextRequest): NextResponse | null {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7).trim();
  const payload = AdminAuthService.verifyAccessToken(token) as any;
  const role = payload?.role?.toString?.().toLowerCase?.();
  if (!payload)
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  if (role !== "super_admin")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  return null;
}

async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "uploads", "subcategories");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: return full mapping document
export async function GET() {
  try {
    await connectDB();
    const doc = await SubcategoryImageMap.findOne({ key: "global" }).lean();
    return NextResponse.json({ data: doc || { key: "global", images: [] } });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch mapping", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: create or replace images for given slugs. Accepts multipart/form-data with files named by each slug or array under "images" + JSON map.
export async function POST(request: NextRequest) {
  // auth
  const authErr = requireSuperAdmin(request);
  if (authErr) return authErr;

  try {
    await connectDB();
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { message: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await request.formData();
    // Optional JSON mapping: { slug: title }
    const mappingJson = form.get("mapping") as string | null;
    let titles: Record<string, string> = {};
    if (mappingJson) {
      try {
        titles = JSON.parse(mappingJson);
      } catch {
        /* ignore */
      }
    }

    const uploadDir = await ensureUploadDir();
    const entries: { slug: string; file: File }[] = [];

    // Strategy: expect fields where the name is the slug, value is a File
    for (const [key, value] of form.entries()) {
      if (value instanceof File && key !== "images" && key !== "mapping") {
        entries.push({ slug: key, file: value });
      }
    }

    // Fallback: if files provided under "images", require a parallel field "slugs" with comma-separated slugs
    if (entries.length === 0) {
      const files = form
        .getAll("images")
        .filter((v): v is File => v instanceof File);
      const slugsField = form.get("slugs");
      if (!files.length || !slugsField) {
        return NextResponse.json(
          {
            message:
              "Provide files as fields named by slug, or 'images' plus 'slugs' list",
          },
          { status: 400 }
        );
      }
      const slugs = String(slugsField)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (slugs.length !== files.length) {
        return NextResponse.json(
          { message: "slugs count must match images count" },
          { status: 400 }
        );
      }
      files.forEach((file, i) => entries.push({ slug: slugs[i], file }));
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const saved: { slug: string; url: string; title?: string }[] = [];

    for (const { slug, file } of entries) {
      const cleanSlug = sanitizeSlug(slug);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${cleanSlug}${ext}`;
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      const urlPath = `/api/uploads/subcategories/${filename}`;
      const url = baseUrl ? `${baseUrl}${urlPath}` : urlPath;
      saved.push({ slug: cleanSlug, url, title: titles[slug] });
    }

    // Upsert single mapping doc
    const doc = await SubcategoryImageMap.findOneAndUpdate(
      { key: "global" },
      { $set: { images: saved } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ message: "Images saved", data: doc });
  } catch (error) {
    console.error("[subcategory-image-map] POST error:", error);
    return NextResponse.json(
      { message: "Failed to save images", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: update one mapping entry (swap an image or update title)
export async function PUT(request: NextRequest) {
  const authErr = requireSuperAdmin(request);
  if (authErr) return authErr;

  try {
    await connectDB();
    const form = await request.formData();
    const slug = sanitizeSlug(String(form.get("slug") || "").trim());
    const title = form.get("title") ? String(form.get("title")) : undefined;
    const file = form.get("image");
    if (!slug)
      return NextResponse.json(
        { message: "slug is required" },
        { status: 400 }
      );

    let urlUpdate: string | undefined;
    if (file && file instanceof File) {
      const uploadDir = await ensureUploadDir();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = path.extname((file as File).name) || ".jpg";
      const filename = `${slug}${ext}`;
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      const urlPath = `/api/uploads/subcategories/${filename}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      urlUpdate = baseUrl ? `${baseUrl}${urlPath}` : urlPath;
    }

    const update: any = {};
    if (title !== undefined) update["images.$.title"] = title;
    if (urlUpdate) update["images.$.url"] = urlUpdate;

    const doc = await SubcategoryImageMap.findOneAndUpdate(
      { key: "global", "images.slug": slug },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc)
      return NextResponse.json({ message: "Slug not found" }, { status: 404 });
    return NextResponse.json({ message: "Updated", data: doc });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update image", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: remove one slug mapping
export async function DELETE(request: NextRequest) {
  const authErr = requireSuperAdmin(request);
  if (authErr) return authErr;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const slug = String(searchParams.get("slug") || "").trim();
    if (!slug)
      return NextResponse.json(
        { message: "slug query param is required" },
        { status: 400 }
      );

    const doc = await SubcategoryImageMap.findOneAndUpdate(
      { key: "global" },
      { $pull: { images: { slug } } },
      { new: true }
    ).lean();

    return NextResponse.json({ message: "Deleted", data: doc });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete image", error: (error as Error).message },
      { status: 500 }
    );
  }
}
