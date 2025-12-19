"use client";

import { AdminRoute } from "@/components/AdminRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard/admin", label: "🎬 Avatar Control", exact: true },
  { href: "/dashboard/admin/users", label: "👥 Users" },
  { href: "/dashboard/admin/challenges", label: "🎯 Challenges" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminRoute>
      <div className="flex h-screen bg-slate-900">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col">
          <h1 className="text-xl font-bold text-white mb-6">Admin Dashboard</h1>
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-300"
                    }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 border-t border-slate-700">
            <Link href="/admin">
              <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                📺 View Main Display
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AdminRoute>
  );
}