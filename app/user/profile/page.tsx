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
  const { user, signOut, loading: authLoading, updateUser } = useAuth();

  const [username, setUsername] = useState("");
  const [team, setTeam] = useState("team1");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleFile = async (file?: File) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);

        // Upload to R2
        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: dataUrl,
              type: "profile",
            }),
          });

          if (!response.ok) throw new Error("Upload failed");

          const { url } = await response.json();
          setProfilePicUrl(url);
          // Immediately show the R2 URL so it matches what others see
          setPreview(url);
        } catch (error: any) {
          console.error("Upload error:", error);
          setMessage(error?.message || "Зураг оруулах үед алдаа гарлаа.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      setMessage("Зураг уншихад алдаа гарлаа.");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (uploading) {
      setMessage("Зураг оруулж дуусахаар хадгална уу.");
      return;
    }
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("users")
      .update({ username, team, sex, profile_pic_url: profilePicUrl })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage(error.message || "Хадгалах үед алдаа гарлаа.");
    } else {
      setMessage("Амжилттай хадгаллаа.");
      const updated = { ...user, username, team, sex, profile_pic_url: profilePicUrl };
      localStorage.setItem("user", JSON.stringify(updated));
      updateUser({ username, team, sex, profile_pic_url: profilePicUrl || null });
      if (profilePicUrl) setPreview(profilePicUrl);
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
      <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E] p-4 text-white">
        <Card className="w-full max-w-xl bg-[#454545] border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Профайл</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden">
                {preview ? (
                  <img src={preview} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-white">
                    No image
                  </div>
                )}
              </div>
              <div>
                <Label className="mb-1 block text-white">Профайл зураг</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFile(e.target.files?.[0])} 
                  disabled={uploading}
                />
                {uploading && <p className="text-xs text-yellow-400 mt-1">Оруулж байна...</p>}
              </div>
            </div>

            <div className="space-y-2 text-white">
              <Label htmlFor="username">Нэр</Label>
              <Input
                id="username"
                value={username ?? ""}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Нэрээ оруулна уу"
                className="border-none bg-[#2d2d2d]"
              />
            </div>

            <div className="space-y-2 text-white border-none">
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

            <div className="space-y-2 text-white border-none">
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
              <Button className="flex-1 bg-[#FFD700] text-[#917800] font-bold" onClick={handleSave} disabled={saving || uploading}>
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
              <Button variant="secondary" onClick={handleLogout} className="font-bold bg-red-400">
                Гарах
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}