import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { NextRequest, NextResponse } from "next/server";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadsBase, ...segments);

  // Path traversal guard: ensure resolved path is strictly within uploadsBase
  if (!filePath.startsWith(uploadsBase + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const stat = await fs.stat(filePath);
  if (!stat.isFile()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileBuffer = await fs.readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
