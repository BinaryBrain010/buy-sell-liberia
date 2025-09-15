import { NextRequest, NextResponse } from "next/server";
import StaticPage from "@/models/StaticPage";
import { connectDB } from "@/lib/mongoose";

// GET: Public endpoint to fetch static page content by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const slug = params.slug.toLowerCase();
    const page = await StaticPage.findOne({ slug }).lean();
    if (!page) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
    return NextResponse.json({
      exists: true,
      slug: page.slug,
      title: page.title,
      content: page.content,
      data: page.data ?? null,
      updatedAt: page.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch page" }, { status: 500 });
  }
}


