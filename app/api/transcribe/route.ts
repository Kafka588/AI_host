export async function POST(req: Request) {
  try {
    const token = process.env.CHIMEGE_STT_API_KEY;
    if (!token) {
      return Response.json({ error: "CHIMEGE_STT_API_KEY not configured" }, { status: 500 });
    }

    const audioBuffer = await req.arrayBuffer();
    if (audioBuffer.byteLength < 5000) {
      return Response.json({ error: "Audio too short" }, { status: 400 });
    }

    console.log("STT bytes:", audioBuffer.byteLength);
    
    // Read WAV header to get actual sample rate
    const view = new DataView(audioBuffer);
    const sampleRate = view.getUint32(24, true);
    console.log("WAV sample rate:", sampleRate);

    const response = await fetch("https://api.chimege.com/v1.2/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Punctuate": "true",
        "Token": token,
        "sample-rate": sampleRate.toString(),
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Chimege STT error:", errText);
      return Response.json({ error: `Transcribe failed: ${response.status}` }, { status: 500 });
    }

    const text = await response.text();
    console.log("Transcribed text:", text);
    return Response.json({ text });
  } catch (e) {
    console.error("Transcribe error:", e);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}