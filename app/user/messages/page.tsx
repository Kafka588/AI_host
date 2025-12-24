"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  username: string;
  is_admin?: boolean;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (response.ok) {
          // Filter out current user and admins
          const filteredUsers = (data.users || []).filter(
            (u: User) => u.id !== user?.id && !u.is_admin
          );
          setUsers(filteredUsers);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [user]);

  // Auto-resize textarea to fit content (expandable input)
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px"; // cap max height
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  const handleSend = async () => {
    if (!user?.id || !selectedUser || !message.trim()) {
      setStatus("Please select a recipient and enter a message");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user_id: user.id,
          to_user_id: selectedUser,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        setStatus("✓ Message sent successfully!");
        setMessage("");
        setSelectedUser("");
      } else {
        const data = await response.json();
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Failed to send message");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-100)" }}>
          💌 Warm Messages
        </h1>
        <p className="text-sm" style={{ color: "var(--text-200)" }}>
          Send warm wishes to your friends
        </p>
      </div>

      <Card
        className="backdrop-blur-sm shadow-lg"
        style={{ background: "var(--bg-200)", borderColor: "var(--bg-300)", borderWidth: 1 }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg" style={{ color: "var(--text-100)" }}>
            Send a Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm" style={{ color: "var(--text-200)" }}>
              To
            </Label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full mt-1 rounded-md px-3 py-2 outline-none transition focus:ring-2"
              style={{
                background: "var(--bg-300)",
                border: "1px solid var(--bg-300)",
                color: "var(--text-100)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
              }}
            >
              <option value="">Select a recipient...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm" style={{ color: "var(--text-200)" }}>
                Your Message
              </Label>
              <span className="text-xs" style={{ color: "var(--text-200)" }}>
                {message.length}/150
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onInput={autoResize}
              rows={3}
              maxLength={150}
              placeholder="Write your warm wishes..."
              className="w-full mt-1 resize-none rounded-md px-3 py-2 outline-none transition focus:ring-2"
              style={{
                background: "var(--bg-300)",
                border: "1px solid var(--bg-300)",
                color: "var(--text-100)",
              }}
            />
            <div className="h-1 mt-2 rounded" style={{ background: "var(--bg-300)" }}>
              <div
                className="h-1 rounded transition-all"
                style={(function(){
                  const pct = Math.min(100, (message.length / 150) * 100);
                  return {
                    width: pct + "%",
                    background: "var(--primary-100)",
                  } as React.CSSProperties;
                })()}
              />
            </div>
          </div>

          {status && (
            <div
              aria-live="polite"
              className="p-3 rounded text-sm"
              style={{
                background: status.startsWith("✓") ? "#166534" : "#7f1d1d",
                color: "#ffffff",
              }}
            >
              {status}
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={loading || !selectedUser || !message.trim()}
            className="w-full font-medium transition"
            style={{
              background: "var(--primary-100)",
              color: "#1a1a1a",
            }}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
