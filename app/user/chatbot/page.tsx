"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-[#1a1a1a]/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <h1 className="text-white font-semibold">Номун</h1>
              <p className="text-xs text-gray-400">Хиймэл Оюун ухаант туслах</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer messages={messages} loading={loading} />
      </div>

      {/* Input Area - with space for bottom nav */}
      <div className="flex-shrink-0 border-t border-white/10 bg-[#2d2d2d] backdrop-blur mb-20">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <ChatInput
            onSend={sendTextMessage}
            onRecord={handleRecord}
            onStopRecord={handleStopRecord}
            recording={recording}
            disabled={loading || speaking}
          />
        </div>
      </div>
    </div>
  );
}
