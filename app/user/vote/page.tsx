"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  name: string;
  sex: string;
  photo_url?: string;
  voteCount: number;
};

type UserVote = {
  id: string;
  voted_for_user_id: string;
  category: string;
};

export default function VotePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedPrincess, setSelectedPrincess] = useState("");
  const [selectedPrince, setSelectedPrince] = useState("");
  const [selectedSweater, setSelectedSweater] = useState("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/votes?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.nominees || []);
        setUserVotes(data.userVotes || []);
      }
    } catch (error) {
      console.error("Failed to fetch voting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (selectedUserId: string, category: string) => {
    if (!user?.id) return;

    setVotingLoading(true);
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: user.id,
          votedForUserId: selectedUserId,
          category,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✓ Vote submitted for ${category}!`);
        if (category === "princess") setSelectedPrincess("");
        if (category === "prince") setSelectedPrince("");
        if (category === "ugly_sweater") setSelectedSweater("");
        fetchData(); // Refresh data
      } else {
        setStatus(`✗ ${data.error}`);
      }
    } catch (error) {
      setStatus("✗ Failed to submit vote");
    } finally {
      setVotingLoading(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const femaleUsers = users.filter((u) => u.sex?.toLowerCase() === "female" && u.id !== user?.id);
  const maleUsers = users.filter((u) => u.sex?.toLowerCase() === "male" && u.id !== user?.id);
  const allUsers = users.filter((u) => u.id !== user?.id);

  const hasVotedPrincess = userVotes.some((v) => v.category === "princess");
  const hasVotedPrince = userVotes.some((v) => v.category === "prince");
  const hasVotedSweater = userVotes.some((v) => v.category === "ugly_sweater");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-100)" }}>
        <p style={{ color: "var(--text-100)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-24" style={{ background: "var(--bg-100)" }}>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold" style={{ color: "var(--primary-100)" }}>
            👑 Vote for Princess & Prince
          </h1>
          <p className="text-lg" style={{ color: "var(--text-200)" }}>
            Cast your vote for the New Year's royalty
          </p>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className="p-3 rounded text-center text-sm font-medium"
            style={{
              background: status.startsWith("✓") ? "#166534" : "#7f1d1d",
              color: "#ffffff",
            }}
          >
            {status}
          </div>
        )}

        {/* Voting Card */}
        <Card style={{ background: "var(--bg-200)", borderColor: "var(--bg-300)", borderWidth: 1 }}>
          <CardHeader>
            <CardTitle style={{ color: "var(--text-100)" }}>Make Your Vote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Princess Vote */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label style={{ color: "var(--text-200)" }} className="text-lg font-semibold">
                  👸 Vote for Princess
                </Label>
                {hasVotedPrincess && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: "var(--accent-100)", color: "#fff" }}>
                    ✓ Voted
                  </span>
                )}
              </div>
              <select
                value={selectedPrincess}
                onChange={(e) => setSelectedPrincess(e.target.value)}
                disabled={hasVotedPrincess}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: "var(--bg-300)",
                  color: "var(--text-100)",
                  border: "1px solid var(--bg-300)",
                  opacity: hasVotedPrincess ? 0.6 : 1,
                }}
              >
                <option value="">Select a princess...</option>
                {femaleUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.voteCount} votes)
                  </option>
                ))}
              </select>
              <Button
                onClick={() => handleVote(selectedPrincess, "princess")}
                disabled={!selectedPrincess || hasVotedPrincess || votingLoading}
                className="w-full font-medium"
                style={{
                  background: hasVotedPrincess ? "var(--accent-100)" : "var(--primary-100)",
                  color: "#1a1a1a",
                }}
              >
                {votingLoading ? "Submitting..." : hasVotedPrincess ? "✓ Already Voted" : "Vote for Princess"}
              </Button>
            </div>

            <hr style={{ borderColor: "var(--bg-300)" }} />

            {/* Prince Vote */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label style={{ color: "var(--text-200)" }} className="text-lg font-semibold">
                  🤴 Vote for Prince
                </Label>
                {hasVotedPrince && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: "var(--accent-100)", color: "#fff" }}>
                    ✓ Voted
                  </span>
                )}
              </div>
              <select
                value={selectedPrince}
                onChange={(e) => setSelectedPrince(e.target.value)}
                disabled={hasVotedPrince}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: "var(--bg-300)",
                  color: "var(--text-100)",
                  border: "1px solid var(--bg-300)",
                  opacity: hasVotedPrince ? 0.6 : 1,
                }}
              >
                <option value="">Select a prince...</option>
                {maleUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.voteCount} votes)
                  </option>
                ))}
              </select>
              <Button
                onClick={() => handleVote(selectedPrince, "prince")}
                disabled={!selectedPrince || hasVotedPrince || votingLoading}
                className="w-full font-medium"
                style={{
                  background: hasVotedPrince ? "var(--accent-100)" : "var(--primary-100)",
                  color: "#1a1a1a",
                }}
              >
                {votingLoading ? "Submitting..." : hasVotedPrince ? "✓ Already Voted" : "Vote for Prince"}
              </Button>
            </div>

            <hr style={{ borderColor: "var(--bg-300)" }} />

            {/* Ugly Sweater Vote */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label style={{ color: "var(--text-200)" }} className="text-lg font-semibold">
                  🧶 Best Ugly Sweater
                </Label>
                {hasVotedSweater && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: "var(--accent-100)", color: "#fff" }}>
                    ✓ Voted
                  </span>
                )}
              </div>
              <select
                value={selectedSweater}
                onChange={(e) => setSelectedSweater(e.target.value)}
                disabled={hasVotedSweater}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: "var(--bg-300)",
                  color: "var(--text-100)",
                  border: "1px solid var(--bg-300)",
                  opacity: hasVotedSweater ? 0.6 : 1,
                }}
              >
                <option value="">Select the best ugly sweater...</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.voteCount} votes)
                  </option>
                ))}
              </select>
              <Button
                onClick={() => handleVote(selectedSweater, "ugly_sweater")}
                disabled={!selectedSweater || hasVotedSweater || votingLoading}
                className="w-full font-medium"
                style={{
                  background: hasVotedSweater ? "var(--accent-100)" : "var(--primary-100)",
                  color: "#1a1a1a",
                }}
              >
                {votingLoading ? "Submitting..." : hasVotedSweater ? "✓ Already Voted" : "Vote for Sweater"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div style={{ background: "var(--bg-200)", borderColor: "var(--bg-300)", borderWidth: 1 }} className="rounded-lg p-4">
          <p style={{ color: "var(--text-200)" }} className="text-sm text-center">
            👸 Princess: {femaleUsers.length} candidates | 🤴 Prince: {maleUsers.length} candidates | 🧶 Ugly Sweater: {allUsers.length} candidates
          </p>
        </div>
      </div>
    </div>
  );
}
