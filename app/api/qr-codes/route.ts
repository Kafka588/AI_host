import QRCode from "qrcode";
import { uploadToR2, getR2PublicUrl, existsInR2 } from "@/lib/r2";
import { NextRequest } from "next/server";

/**
 * Generate QR code and upload to R2
 * GET /api/qr-codes?taskId=123
 * POST /api/qr-codes { taskId: "123", regenerate: false }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return Response.json({ error: "taskId is required" }, { status: 400 });
    }

    const qrKey = `qr-codes/task-${taskId}.png`;
    
    // Check if QR code already exists
    const exists = await existsInR2(qrKey);
    
    if (exists) {
      const url = getR2PublicUrl(qrKey);
      return Response.json({ url, cached: true });
    }

    // Generate QR code
    const qrBuffer = await QRCode.toBuffer(taskId, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Upload to R2
    const url = await uploadToR2(qrKey, qrBuffer, "image/png");

    return Response.json({ url, cached: false });
  } catch (error) {
    console.error("QR generation error:", error);
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { taskId, regenerate = false } = await req.json();

    if (!taskId) {
      return Response.json({ error: "taskId is required" }, { status: 400 });
    }

    const qrKey = `qr-codes/task-${taskId}.png`;

    // If not regenerating, check if exists
    if (!regenerate) {
      const exists = await existsInR2(qrKey);
      if (exists) {
        const url = getR2PublicUrl(qrKey);
        return Response.json({ url, regenerated: false });
      }
    }

    // Generate QR code
    const qrBuffer = await QRCode.toBuffer(taskId, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Upload to R2
    const url = await uploadToR2(qrKey, qrBuffer, "image/png");

    return Response.json({ url, regenerated: true });
  } catch (error) {
    console.error("QR generation error:", error);
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
