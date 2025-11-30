import { Message } from "@/types";

type Props = {
  message: Message;
};

export function ChatMessage({ message }: Props) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-300 text-black"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}