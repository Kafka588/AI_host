"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/user/scoreboard", label: "Score", icon: "🏆" },
  { href: "/user/chatbot", label: "Chat", icon: "💬" },
  { href: "/user/profile", label: "Profile", icon: "👤" },
];

export function UserBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl rounded-2xl bg-white/90 shadow-lg backdrop-blur border border-white/60">
      <div className="grid grid-cols-3">
        {links.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 text-sm font-medium transition ${
                active ? "text-purple-600" : "text-gray-700"
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