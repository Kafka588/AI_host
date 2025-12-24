import { Message } from "@/types";

type Props = {
  message: Message;
};

export function ChatMessage({ message }: Props) {
  return (
    <div className="group">
      {message.role === "user" ? (
        <div className="flex gap-3 justify-end">
          <div className="max-w-[80%] bg-[#2d2d2d] rounded-2xl px-4 py-3 text-white">
            {message.text}
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
            Y
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
          <div className="flex-1 text-gray-100 leading-relaxed">
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
}