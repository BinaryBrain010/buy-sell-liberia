import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    // Basic security: prevent path traversal
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json(
        { message: "Invalid filename" },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "subcategories",
      filename
    );
    const data = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
        ? "image/gif"
        : "image/jpeg";

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to read file" },
      { status: 500 }
    );
  }
}
