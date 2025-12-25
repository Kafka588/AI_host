import { uploadBase64ImageToR2 } from "@/lib/r2";
import { NextRequest } from "next/server";

/**
 * Upload images or videos to R2
 * POST /api/upload { media: base64, type: "task" | "submission" | "avatar", filename?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { media, image, type, filename } = await req.json();
    const fileData = media || image; // Support both 'media' and 'image' for backwards compatibility

    if (!fileData || !type) {
      return Response.json(
        { error: "media/image and type are required" },
        { status: 400 }
      );
    }

    // Determine folder based on type
    const folderMap: Record<string, string> = {
      task: "tasks",
      submission: "submissions",
      avatar: "avatars",
      profile: "profiles",
      other: "uploads",
    };

    const folder = folderMap[type] || "uploads";

    // Upload to R2 (handles both images and videos)
    const url = await uploadBase64ImageToR2(fileData, folder, filename || "");

    return Response.json({ url, success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
