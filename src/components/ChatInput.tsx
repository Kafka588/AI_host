import { useState } from "react";

type Props = {
  onSend: (text: string) => void;
  onRecord: () => void;
  onStopRecord: () => void;
  recording: boolean;
  disabled: boolean;
};

export function ChatInput({
  onSend,
  onRecord,
  onStopRecord,
  recording,
  disabled,
}: Props) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) {
      handleSend();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[#2d2d2d] rounded-2xl px-4 py-3 shadow-lg border border-white/10">
        <input
          className="flex-1 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Номунтай чатлах..."
          onKeyDown={handleKeyDown}
          disabled={disabled || recording}
        />
        <div className="flex gap-2">
          <button
            onClick={recording ? onStopRecord : onRecord}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${
              recording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-white/10 hover:bg-white/20"
            } text-white`}
          >
            {recording ? "⏹" : "🎤"}
          </button>
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}