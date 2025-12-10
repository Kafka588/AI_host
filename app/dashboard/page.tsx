"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.is_admin) {
        router.push("/admin");
      } else {
        router.push("/user/scoreboard");
      }
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
      <div>Перенаправялав байна...</div>
    </ProtectedRoute>
  );
}