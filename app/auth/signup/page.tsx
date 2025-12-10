"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    sex: "male" as "male" | "female",
    team: "team1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Нууц үгүүд таарахгүй байна");
      return;
    }
    if (formData.password.length < 4) {
      setError("Нууц үг 4 оронтой байх ёстой");
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(
      formData.username,
      formData.password,
      formData.sex,
      formData.team
    );
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Бүртгүүлэх</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Хэрэглэгчийн нэр</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                required
                placeholder="Нэр оруул"
              />
            </div>

            <div className="space-y-2">
              <Label>Хүйс</Label>
              <Select
                value={formData.sex}
                onValueChange={(v) => setFormData((p) => ({ ...p, sex: v as "male" | "female" }))}
              >
                <SelectTrigger><SelectValue placeholder="Сонгох" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Эрэгтэй</SelectItem>
                  <SelectItem value="female">Эмэгтэй</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Баг</Label>
              <Select
                value={formData.team}
                onValueChange={(v) => setFormData((p) => ({ ...p, team: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Баг сонгох" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Баг 1</SelectItem>
                  <SelectItem value="team2">Баг 2</SelectItem>
                  <SelectItem value="team3">Баг 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                required
                placeholder="4 оронтой"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Нууц үг баталгаажуул</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                placeholder="Дахин оруул"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Аль хэдийн бүртгүүлсэн үү?{" "}
              <a className="text-purple-600 hover:underline" href="/auth/signin">
                Нэвтрэх
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}