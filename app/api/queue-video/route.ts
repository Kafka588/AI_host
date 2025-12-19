// Simple in-memory queue for videos
// In production, this would be a database or WebSocket for real-time sync
let videoQueue: { path: string; muted?: boolean }[] = [];

export async function POST(req: Request) {
  try {
    const { videoPath, action, muted } = await req.json();

    if (action === "queue" && videoPath) {
      videoQueue.push({ path: videoPath, muted: muted ?? false });
      return Response.json({ success: true, queue: videoQueue });
    }

    if (action === "get-queue") {
      return Response.json({ queue: videoQueue });
    }

    if (action === "clear") {
      videoQueue = [];
      return Response.json({ success: true, queue: videoQueue });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("/api/queue-video error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ queue: videoQueue });
}
