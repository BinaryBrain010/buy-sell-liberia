import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import { join, normalize } from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Serve files from the project-level /uploads directory at /uploads/*
export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const safeParts = (params.path || []).map((p) => p.replace(/\.+/g, "."));
    const relPath = safeParts.join("/");
    const absPath = normalize(join(process.cwd(), "uploads", relPath));

    // Prevent path traversal outside the uploads dir
    const root = normalize(join(process.cwd(), "uploads"));
    if (!absPath.startsWith(root)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!existsSync(absPath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const stats = await stat(absPath);
    if (!stats.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Determine basic content type from extension
    const ext = absPath.split(".").pop()?.toLowerCase();
    const type =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : ext === "gif"
        ? "image/gif"
        : "application/octet-stream";

    const stream = createReadStream(absPath);
    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[UPLOADS SERVE] Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
