"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserBottomNav } from "@/components/UserBottomNav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1E1E1E] pb-24">
        {children}
        <UserBottomNav />
      </div>
    </ProtectedRoute>
  );
}