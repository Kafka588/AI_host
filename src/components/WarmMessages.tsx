"use client";

import { useState, useEffect } from "react";

type Message = {
  id: string;
  message: string;
  from_user: {
    username: string;
    profile_pic_url: string | null;
  };
  to_user: {
    username: string;
  };
};

export function WarmMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages");
        const data = await response.json();
        if (response.ok && data.messages?.length > 0) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const cycleInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 500);
    }, 4000); // Show each message for 4 seconds

    return () => clearInterval(cycleInterval);
  }, [messages.length]);

  if (messages.length === 0) return null;

  const currentMessage = messages[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50">
      <div
        className={`bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-lg shadow-2xl p-4 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex-shrink-0 overflow-hidden">
            {currentMessage.from_user.profile_pic_url ? (
              <img
                src={currentMessage.from_user.profile_pic_url}
                alt={currentMessage.from_user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl">
                💌
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs text-white/80 mb-1">
              <strong>{currentMessage.from_user.username}</strong> → {currentMessage.to_user.username}
            </div>
            <p className="text-white font-medium text-sm leading-relaxed">
              {currentMessage.message}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1">
          {messages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
