import { useState, useRef } from "react";
import { resampleAudio } from "@/utils/audio";
import { AUDIO_CONFIG } from "@/constants";

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (): Promise<boolean> => {
    if (recording) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONFIG,
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/wav")
        ? "audio/wav"
        : "audio/webm;codecs=opus";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);
      return true;
    } catch (error) {
      console.error("Mic error:", error);
      return false;
    }
  };

  const stopRecording = async (): Promise<{
    wavBlob: Blob | null;
    error?: string;
  }> => {
    if (!mediaRecorderRef.current || !recording) {
      return { wavBlob: null };
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        const stream = mediaRecorder.stream;
        stream.getTracks().forEach((t) => t.stop());

        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        if (audioBlob.size < 5000) {
          resolve({ wavBlob: null, error: "Аудио богино байна." });
          return;
        }

        if (mimeType.includes("webm")) {
          const result = await resampleAudio(audioBlob);
          if (result.success) {
            resolve({ wavBlob: result.wavBlob });
          } else {
            resolve({ wavBlob: null, error: result.error });
          }
        } else {
          resolve({ wavBlob: audioBlob });
        }
      };

      mediaRecorder.stop();
      setRecording(false);
    });
  };

  return { recording, startRecording, stopRecording };
}