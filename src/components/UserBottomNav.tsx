"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/user/scoreboard", label: "Score", icon: "🏆" },
  { href: "/user/chatbot", label: "Chat", icon: "💬" },
  { href: "/user/tasks", label: "Tasks", icon: "📋" },
  { href: "/user/messages", label: "Messages", icon: "💌" },
  { href: "/user/profile", label: "Profile", icon: "👤" },
];

export function UserBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl rounded-2xl bg-[#454545] shadow-lg backdrop-blur border border-white/60 border-none text-none">
      <div className="grid grid-cols-5">
        {links.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 text-sm font-medium transition ${
                active ? "text-[#917800] font-bold bg-[#FFD700] rounded-2xl" : "text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}