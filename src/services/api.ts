import { Message, TTSConfig } from "@/types";

export async function transcribeAudio(wavBlob: Blob): Promise<string> {
  const resp = await fetch("/api/transcribe", {
    method: "POST",
    body: wavBlob,
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.error || "Transcribe failed");
  }

  return data.text?.trim() || "";
}

export async function sendChatMessage(
  messages: Message[],
  eventData: string
): Promise<string> {
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, eventData }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.error || "Chat failed");
  }

  return data.reply;
}

export async function synthesizeSpeech(
  text: string,
  config: TTSConfig
): Promise<Blob> {
  const resp = await fetch("/api/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, ...config }),
  });

  if (!resp.ok) {
    throw new Error("TTS failed");
  }

  return await resp.blob();
}