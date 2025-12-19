"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [team, setTeam] = useState("team1");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setTeam(user.team ?? "team1");
      setSex((user.sex as "male" | "female") ?? "male");
      setProfilePicUrl(user.profile_pic_url ?? null);
      setPreview(user.profile_pic_url ?? null);
    }
  }, [user]);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setProfilePicUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("users")
      .update({ username, team, sex, profile_pic_url: profilePicUrl })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage("Хадгалах үед алдаа гарлаа.");
    } else {
      setMessage("Амжилттай хадгаллаа.");
      const updated = { ...user, username, team, sex, profile_pic_url: profilePicUrl };
      localStorage.setItem("user", JSON.stringify(updated));
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/signin");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ачаалаж байна...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Профайл</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
                {preview ? (
                  <img src={preview} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                    No image
                  </div>
                )}
              </div>
              <div>
                <Label className="mb-1 block">Профайл зураг</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Никнэйм</Label>
              <Input
                id="username"
                value={username ?? ""}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Никнэйм"
              />
            </div>

            <div className="space-y-2">
              <Label>Хүйс</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as "male" | "female")}>
                <SelectTrigger>
                  <SelectValue placeholder="Сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Эрэгтэй</SelectItem>
                  <SelectItem value="female">Эмэгтэй</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Баг</Label>
              <Select value={team} onValueChange={(v) => setTeam(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Баг сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Баг 1</SelectItem>
                  <SelectItem value="team2">Баг 2</SelectItem>
                  <SelectItem value="team3">Баг 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {message && <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded">{message}</div>}

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                Гарах
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}