"use client";

import { AdminRoute } from "@/components/AdminRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard/admin", label: "Avatar Control", exact: true },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/challenges", label: "Challenges" },
  { href: "/dashboard/admin/teams", label: "Teams" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminRoute>
      <div className="bg-slate-900 min-h-screen md:flex">
        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 z-30 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <span className="text-white font-semibold">Admin Dashboard</span>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white">
                📺 Display
              </Button>
            </Link>
            <Button size="sm" onClick={() => setMobileOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
              Menu
            </Button>
          </div>
        </div>

        {/* Mobile Overlay Sidebar */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed z-40 top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col md:hidden">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <Button size="sm" variant="ghost" className="text-gray-300" onClick={() => setMobileOpen(false)}>Close</Button>
              </div>
              <nav className="space-y-2 flex-1 overflow-auto">
                {navItems.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        onClick={() => setMobileOpen(false)}
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
                  <Button variant="ghost" className="w-full text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
                    📺 View Main Display
                  </Button>
                </Link>
              </div>
            </aside>
          </>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-slate-800 border-r border-slate-700 p-4 flex-col">
          <h1 className="text-xl font-bold text-white mb-6">Admin Dashboard</h1>
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </AdminRoute>
  );
}