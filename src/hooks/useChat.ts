import { useState } from "react";
import { Message } from "@/types";
import { sendChatMessage, synthesizeSpeech, transcribeAudio } from "@/services/api";
import { EVENT_DATA, TTS_DEFAULT } from "@/constants";

export function useChat(initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const addMessage = (message: Message) => {
    setMessages((m) => [...m, message]);
  };

  const processVoiceInput = async (wavBlob: Blob) => {
    setLoading(true);
    try {
      const text = await transcribeAudio(wavBlob);

      if (!text) {
        addMessage({ role: "bot", text: "Танигдаагүй." });
        return;
      }

      await sendTextMessage(text);
    } catch (error) {
      console.error("Transcribe error:", error);
      addMessage({ role: "bot", text: "STT алдаа." });
    } finally {
      setLoading(false);
    }
  };

  const sendTextMessage = async (content: string) => {
    const userMsg: Message = { role: "user", text: content };
    addMessage(userMsg);
    setLoading(true);

    try {
      const reply = await sendChatMessage([...messages, userMsg], EVENT_DATA);
      const botMsg: Message = { role: "bot", text: reply };
      addMessage(botMsg);
      await speakText(reply);
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({ role: "bot", text: "Чат алдаа." });
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      setSpeaking(true);
      const audioBlob = await synthesizeSpeech(text, TTS_DEFAULT);
      const url = URL.createObjectURL(audioBlob);

      const audio = new Audio(url);
      audio.onended = () => setSpeaking(false);
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setSpeaking(false);
    }
  };

  return {
    messages,
    loading,
    speaking,
    processVoiceInput,
    sendTextMessage,
  };
}