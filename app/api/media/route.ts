import { NextRequest } from "next/server";
import { getFromR2 } from "@/lib/r2";

function extToMime(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    avi: "video/x-msvideo",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key" }), { status: 400 });
    }

    const data = await getFromR2(key);
    if (!data) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    const extMatch = key.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : "bin";
    const mime = extToMime(ext);

    // Create a real ArrayBuffer and copy bytes to avoid SharedArrayBuffer typing
    const ab = new ArrayBuffer(data.byteLength);
    const view = new Uint8Array(ab);
    view.set(data);
    return new Response(ab, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("/api/media error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
