"use client";
import { ChatContainer } from "@/components/ChatContainer";
import { ChatInput } from "@/components/ChatInput";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useChat } from "@/hooks/useChat";
import { INITIAL_MESSAGE } from "@/constants";

export default function Home() {
  const { messages, loading, speaking, processVoiceInput, sendTextMessage } =
    useChat([INITIAL_MESSAGE]);

  const { recording, startRecording, stopRecording } = useAudioRecorder();

  const handleRecord = async () => {
    const success = await startRecording();
    if (!success) {
      alert("Микрофон алдаа.");
    }
  };

  const handleStopRecord = async () => {
    const { wavBlob, error } = await stopRecording();

    if (error) {
      const errorMsg = { role: "bot" as const, text: error };
      // You'd need to expose addMessage or handle this in useChat
      return;
    }

    if (wavBlob) {
      await processVoiceInput(wavBlob);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl flex flex-col h-[80vh]">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <h1 className="font-bold text-xl">🎉 AI Host</h1>
          <p className="text-sm">Бичих эсвэл 🎤 дарж ярь.</p>
        </div>

        <ChatContainer messages={messages} loading={loading} />

        <ChatInput
          onSend={sendTextMessage}
          onRecord={handleRecord}
          onStopRecord={handleStopRecord}
          recording={recording}
          disabled={loading || speaking}
        />
      </div>
    </div>
  );
}
