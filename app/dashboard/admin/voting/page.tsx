"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Nominee = {
  id: string;
  name: string;
  category: "princess" | "prince";
  user_id: string;
  photo_url?: string;
};

type VoteResult = {
  nominee: Nominee;
  voteCount: number;
};

export default function AdminVotingPage() {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNominee, setNewNominee] = useState({
    name: "",
    category: "princess" as "princess" | "prince",
    userId: "",
    photoUrl: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [nomineesRes, usersRes, votesRes] = await Promise.all([
        fetch("/api/nominees"),
        fetch("/api/users"),
        fetch("/api/votes"),
      ]);

      const nomineesData = await nomineesRes.json();
      const usersData = await usersRes.json();
      const votesData = await votesRes.json();

      setNominees(nomineesData.nominees || []);
      setUsers(usersData.users || []);
      setVotes(votesData.nominees || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNominee = async () => {
    if (!newNominee.name || !newNominee.userId) {
      setStatus("✗ Please fill in all required fields");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    try {
      const response = await fetch("/api/nominees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newNominee.name,
          category: newNominee.category,
          userId: newNominee.userId,
          photoUrl: newNominee.photoUrl || null,
        }),
      });

      if (response.ok) {
        setStatus("✓ Nominee added successfully!");
        setShowAddModal(false);
        setNewNominee({ name: "", category: "princess", userId: "", photoUrl: "" });
        fetchData();
      } else {
        const data = await response.json();
        setStatus(`✗ ${data.error}`);
      }
    } catch (error) {
      setStatus("✗ Failed to add nominee");
    } finally {
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const handleDeleteNominee = async (id: string) => {
    if (!confirm("Are you sure you want to remove this nominee?")) return;

    try {
      const response = await fetch(`/api/nominees?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStatus("✓ Nominee removed");
        fetchData();
      } else {
        setStatus("✗ Failed to remove nominee");
      }
    } catch (error) {
      setStatus("✗ Failed to remove nominee");
    } finally {
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const getVoteResults = () => {
    const voteCounts: Record<string, number> = {};
    votes.forEach((v: any) => {
      voteCounts[v.id] = v.voteCount || 0;
    });

    const results = nominees.map((nominee) => ({
      nominee,
      voteCount: voteCounts[nominee.id] || 0,
    }));

    const princessResults = results
      .filter((r) => r.nominee.category === "princess")
      .sort((a, b) => b.voteCount - a.voteCount);
    const princeResults = results
      .filter((r) => r.nominee.category === "prince")
      .sort((a, b) => b.voteCount - a.voteCount);

    return { princessResults, princeResults };
  };

  const { princessResults, princeResults } = getVoteResults();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-100)" }}>
        <p style={{ color: "var(--text-100)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" style={{ background: "var(--bg-100)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: "var(--primary-100)" }}>
          👑 Voting Management
        </h1>
        <Button
          onClick={() => setShowAddModal(true)}
          style={{ background: "var(--primary-100)", color: "#1a1a1a" }}
        >
          + Add Nominee
        </Button>
      </div>

      {status && (
        <div
          className="p-3 rounded text-sm text-center font-medium max-w-md mx-auto"
          style={{
            background: status.startsWith("✓") ? "#166534" : "#7f1d1d",
            color: "#ffffff",
          }}
        >
          {status}
        </div>
      )}

      {/* Add Nominee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" style={{ background: "var(--bg-200)", borderColor: "var(--bg-300)" }}>
            <CardHeader>
              <CardTitle style={{ color: "var(--text-100)" }}>Add New Nominee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label style={{ color: "var(--text-200)" }}>Name</Label>
                <Input
                  value={newNominee.name}
                  onChange={(e) => setNewNominee({ ...newNominee, name: e.target.value })}
                  placeholder="Enter nominee name"
                  style={{ background: "var(--bg-300)", color: "var(--text-100)", border: "1px solid var(--bg-300)" }}
                />
              </div>

              <div>
                <Label style={{ color: "var(--text-200)" }}>Category</Label>
                <select
                  value={newNominee.category}
                  onChange={(e) =>
                    setNewNominee({ ...newNominee, category: e.target.value as "princess" | "prince" })
                  }
                  className="w-full px-3 py-2 rounded"
                  style={{ background: "var(--bg-300)", color: "var(--text-100)", border: "1px solid var(--bg-300)" }}
                >
                  <option value="princess">👸 Princess</option>
                  <option value="prince">🤴 Prince</option>
                </select>
              </div>

              <div>
                <Label style={{ color: "var(--text-200)" }}>User</Label>
                <select
                  value={newNominee.userId}
                  onChange={(e) => setNewNominee({ ...newNominee, userId: e.target.value })}
                  className="w-full px-3 py-2 rounded"
                  style={{ background: "var(--bg-300)", color: "var(--text-100)", border: "1px solid var(--bg-300)" }}
                >
                  <option value="">Select a user...</option>
                  {users
                    .filter((u) => !u.is_admin)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <Label style={{ color: "var(--text-200)" }}>Photo URL (optional)</Label>
                <Input
                  value={newNominee.photoUrl}
                  onChange={(e) => setNewNominee({ ...newNominee, photoUrl: e.target.value })}
                  placeholder="https://..."
                  style={{ background: "var(--bg-300)", color: "var(--text-100)", border: "1px solid var(--bg-300)" }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAddNominee}
                  className="flex-1"
                  style={{ background: "var(--primary-100)", color: "#1a1a1a" }}
                >
                  Add Nominee
                </Button>
                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewNominee({ name: "", category: "princess", userId: "", photoUrl: "" });
                  }}
                  className="flex-1"
                  style={{ background: "var(--bg-300)", color: "var(--text-100)" }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vote Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Princess Results */}
        <Card style={{ background: "var(--bg-200)", borderColor: "var(--bg-300)" }}>
          <CardHeader>
            <CardTitle style={{ color: "var(--text-100)" }}>👸 Princess Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {princessResults.length === 0 ? (
              <p style={{ color: "var(--text-200)" }}>No nominees yet</p>
            ) : (
              princessResults.map((result, idx) => (
                <div
                  key={result.nominee.id}
                  className="flex items-center justify-between p-3 rounded"
                  style={{
                    background: idx === 0 ? "var(--primary-300)" : "var(--bg-300)",
                    border: idx === 0 ? "2px solid var(--primary-100)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold" style={{ color: "var(--text-100)" }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-100)" }}>
                        {result.nominee.name}
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-200)" }}>
                        {result.voteCount} votes
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteNominee(result.nominee.id)}
                    className="text-xs"
                    style={{ background: "#7f1d1d", color: "#fff" }}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Prince Results */}
        <Card style={{ background: "var(--bg-200)", borderColor: "var(--bg-300)" }}>
          <CardHeader>
            <CardTitle style={{ color: "var(--text-100)" }}>🤴 Prince Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {princeResults.length === 0 ? (
              <p style={{ color: "var(--text-200)" }}>No nominees yet</p>
            ) : (
              princeResults.map((result, idx) => (
                <div
                  key={result.nominee.id}
                  className="flex items-center justify-between p-3 rounded"
                  style={{
                    background: idx === 0 ? "var(--primary-300)" : "var(--bg-300)",
                    border: idx === 0 ? "2px solid var(--primary-100)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold" style={{ color: "var(--text-100)" }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-100)" }}>
                        {result.nominee.name}
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-200)" }}>
                        {result.voteCount} votes
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteNominee(result.nominee.id)}
                    className="text-xs"
                    style={{ background: "#7f1d1d", color: "#fff" }}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
