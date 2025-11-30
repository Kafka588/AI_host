function sanitizeForTTS(raw: string): string {
  // Allowed: Cyrillic U+0400–U+04FF, space, ? ! . - ' " : , 
  return raw
    .replace(/[^\u0400-\u04FF\s\?\!\.\-'"\":,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const token = process.env.CHIMEGE_TTS_API_KEY;
    if (!token) return Response.json({ error: "CHIMEGE_TTS_API_KEY not configured" }, { status: 500 });

    const { text, voiceId = "FEMALE3v2", speed = 1, pitch = 1, sampleRate = 22050 } = await req.json();
    if (!text) return Response.json({ error: "Text is required" }, { status: 400 });

    const cleaned = sanitizeForTTS(text);
    if (!cleaned) return Response.json({ error: "Text became empty after sanitizing" }, { status: 400 });

    const response = await fetch("https://api.chimege.com/v1.2/synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "plain/text",
        "Token": token,
        "voice-id": voiceId,
        "speed": speed.toString(),
        "pitch": pitch.toString(),
        "sample-rate": sampleRate.toString(),
      },
      body: cleaned,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("TTS error body:", err);
      return Response.json({ error: `Synthesize failed: ${err}` }, { status: 400 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, { headers: { "Content-Type": "audio/wav" } });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}