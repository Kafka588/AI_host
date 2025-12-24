"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn(formData.username, formData.password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1626] p-4">
      <Card className="w-full max-w-md bg-[#363C4E] border-none">
        <CardHeader>
          <CardTitle className="text-center font-bold text-2xl text-[#FFD700]">Нэвтрэх</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2 text-white">
              <Label htmlFor="username">Хэрэглэгчийн нэр</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                required
                placeholder="Нэр оруул"
              />
            </div>

            <div className="space-y-2 text-white">
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                required
                placeholder="Нууц үг оруул"
              />
            </div>

            <Button type="submit" className="w-full bg-[#FFD700] text-white font-bold h-12" disabled={loading}>
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Шинэ хэрэглэгч үү?{" "}
              <a className="text-[#FFD700] hover:underline" href="/auth/signup">
                Бүртгүүлэх
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}