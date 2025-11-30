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
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {messages.map((m, i) => (
        <ChatMessage key={i} message={m} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="px-4 py-2 rounded-lg bg-gray-300 text-sm">
            Бодож байна...
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}