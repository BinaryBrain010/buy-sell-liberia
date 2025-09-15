import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import { connectDB } from "@/lib/mongoose";
import StaticPage from "@/models/StaticPage";

// POST: Create a static page (super_admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No token" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object" || (payload as any).role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, content, data } = await req.json();
    if (!title || (!content && !data)) {
      return NextResponse.json({ error: "Provide title and either content or data" }, { status: 400 });
    }

    await connectDB();
    const slug = params.slug.toLowerCase();
    const exists = await StaticPage.findOne({ slug });
    if (exists) return NextResponse.json({ error: "Page already exists" }, { status: 409 });

    const page = await StaticPage.create({ slug, title, content: content || "", data });
    return NextResponse.json({
      slug: page.slug,
      title: page.title,
      content: page.content,
      data: page.data ?? null,
      createdAt: page.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create page" }, { status: 500 });
  }
}

// PATCH: Update a static page (super_admin and admin allowed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No token" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      !["super_admin", "admin"].includes((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, content, data } = await req.json();
    if (!title && !content && data === undefined) {
      return NextResponse.json({ error: "Provide title, content or data to update" }, { status: 400 });
    }

    await connectDB();
    const slug = params.slug.toLowerCase();
    const updated = await StaticPage.findOneAndUpdate(
      { slug },
      { $set: { ...(title ? { title } : {}), ...(content !== undefined ? { content } : {}), ...(data !== undefined ? { data } : {}) } },
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    return NextResponse.json({
      slug: updated.slug,
      title: updated.title,
      content: updated.content,
      data: updated.data ?? null,
      updatedAt: updated.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update page" }, { status: 500 });
  }
}


