"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserBottomNav } from "@/components/UserBottomNav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 pb-24">
        {children}
        <UserBottomNav />
      </div>
    </ProtectedRoute>
  );
}