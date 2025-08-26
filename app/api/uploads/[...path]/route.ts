import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFileSync, existsSync, statSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = join(process.cwd(), "uploads", ...params.path);

  if (!existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const stat = statSync(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
  else if (ext === "png") contentType = "image/png";
  else if (ext === "gif") contentType = "image/gif";
  else if (ext === "webp") contentType = "image/webp";

  const buffer = readFileSync(filePath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
