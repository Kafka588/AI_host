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
    <div className="p-4 border-t flex gap-2">
      <input
        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Асуултаа бич..."
        onKeyDown={handleKeyDown}
        disabled={disabled || recording}
      />
      <button
        onClick={recording ? onStopRecord : onRecord}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          recording
            ? "bg-red-600 hover:bg-red-700"
            : "bg-purple-600 hover:bg-purple-700"
        } text-white`}
      >
        {recording ? "⏹" : "🎤"}
      </button>
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold disabled:bg-gray-400"
      >
        Илгээх
      </button>
    </div>
  );
}