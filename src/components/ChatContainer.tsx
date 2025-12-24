"use client";
import { useEffect, useRef } from "react";
import { Message } from "@/types";
import { ChatMessage } from "./ChatMessage";

type Props = {
  messages: Message[];
  loading: boolean;
};

export function ChatContainer({ messages, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}