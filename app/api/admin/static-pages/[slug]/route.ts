import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import { connectDB } from "@/lib/mongoose";
import StaticPage from "@/models/StaticPage";

type RouteParams = { params: { slug: string } };

const ALLOWED_SLUGS = new Set([
  "about",
  "contact",
  "help",
  "safety",
  "terms",
  "privacy",
  "faq",
  "disclaimer",
]);

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function notFound(message = "Page not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader)
    return { ok: false as const, error: unauthorized("No token") };
  const token = authHeader.split(" ")[1];
  const payload = AdminAuthService.verifyAccessToken(token) as any;
  if (!payload || typeof payload !== "object") {
    return { ok: false as const, error: unauthorized("Invalid token") };
  }
  if (!AdminAuthService.isAllowedRole(payload.role)) {
    return { ok: false as const, error: forbidden() };
  }
  return { ok: true as const };
}

function validateSlug(raw: string) {
  const slug = (raw || "").toLowerCase();
  if (!ALLOWED_SLUGS.has(slug)) {
    return {
      ok: false as const,
      error: badRequest(
        `Unsupported slug '${raw}'. Allowed: ${[...ALLOWED_SLUGS].join(", ")}`
      ),
    };
  }
  return { ok: true as const, slug };
}

// Create a static page for the given slug
export async function POST(request: NextRequest, ctx: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.error;

    const v = validateSlug(ctx.params.slug);
    if (!v.ok) return v.error;
    const slug = v.slug;

    await connectDB();

    const body = await request.json().catch(() => ({}));
    const { title, content, data } = body || {};
    if (!title) return badRequest("'title' is required");
    if ((content == null || content === "") && data == null) {
      return badRequest("Provide either 'content' (string) or 'data' (object)");
    }

    const existing = await StaticPage.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Page already exists", exists: true },
        { status: 409 }
      );
    }

    const created = await StaticPage.create({
      slug,
      title,
      content: content ?? "",
      data,
    });
    return NextResponse.json(
      {
        message: "Static page created",
        page: {
          slug: created.slug,
          title: created.title,
          content: created.content,
          data: created.data ?? null,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create page" },
      { status: 500 }
    );
  }
}

// Update an existing static page for the given slug (partial update)
export async function PATCH(request: NextRequest, ctx: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.error;

    const v = validateSlug(ctx.params.slug);
    if (!v.ok) return v.error;
    const slug = v.slug;

    await connectDB();

    const body = await request.json().catch(() => ({}));
    const update: any = {};
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.content === "string") update.content = body.content;
    if (body.data !== undefined) update.data = body.data; // allow null to clear

    if (Object.keys(update).length === 0) {
      return badRequest(
        "No valid fields to update. Allowed: title, content, data"
      );
    }

    const page = await StaticPage.findOneAndUpdate(
      { slug },
      { $set: update },
      { new: true }
    );
    if (!page) return notFound();

    return NextResponse.json({
      message: "Static page updated",
      page: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        data: page.data ?? null,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update page" },
      { status: 500 }
    );
  }
}

// Delete a static page for the given slug
export async function DELETE(request: NextRequest, ctx: RouteParams) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.error;

    const v = validateSlug(ctx.params.slug);
    if (!v.ok) return v.error;
    const slug = v.slug;

    await connectDB();

    const deleted = await StaticPage.findOneAndDelete({ slug });
    if (!deleted) return notFound();

    return NextResponse.json({ message: "Static page deleted", slug });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete page" },
      { status: 500 }
    );
  }
}
