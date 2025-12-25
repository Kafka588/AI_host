"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase, User } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (
    username: string,
    password: string,
    sex: "male" | "female",
    team: string
  ) => Promise<{ error?: string }>;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (
    username: string,
    password: string,
    sex: "male" | "female",
    team: string
  ) => {
    try {
      const passwordHash = await hashPassword(password);

      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            username,
            password_hash: passwordHash,
            sex,
            team,
            is_admin: false,
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return {};
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const passwordHash = await hashPassword(password);

      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("username", username)
        .single();

      if (error || !data) {
        return { error: "Хэрэглэгч олдсонгүй" };
      }

      if (data.password_hash !== passwordHash) {
        return { error: "Нууц үг буруу" };
      }

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return {};
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch } as User;
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}