"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

type Team = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

type TeamScoreData = {
  team_id: string;
  score: number;
};

type TeamDisplay = {
  id: string;
  name: string;
  description?: string;
  score: number;
  memberCount: number;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamScores, setTeamScores] = useState<Map<string, number>>(new Map());
  const [teamMembers, setTeamMembers] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [scoreForm, setScoreForm] = useState({ amount: 0, reason: "" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchTeamScores();
    fetchTeamMembers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      const data = await response.json();
      if (response.ok) {
        setTeams(data.teams || []);
      } else {
        setError(data.error || "Failed to load teams");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamScores = async () => {
    try {
      const response = await fetch("/api/team-scores");
      const data = await response.json();
      if (response.ok) {
        const scoreMap = new Map();
        (data.transactions || []).forEach((trans: any) => {
          // Sum up all transactions per team to get current score
          const current = scoreMap.get(trans.team_id) || 0;
          scoreMap.set(trans.team_id, current + trans.amount);
        });
        setTeamScores(scoreMap);
      }
    } catch (err) {
      console.error("Failed to fetch team scores", err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (response.ok) {
        const memberMap = new Map();
        (data.users || []).forEach((user: any) => {
          if (user.team) {
            const current = memberMap.get(user.team) || 0;
            memberMap.set(user.team, current + 1);
          }
        });
        setTeamMembers(memberMap);
      }
    } catch (err) {
      console.error("Failed to fetch team members", err);
    }
  };

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }
    setUpdating(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...formData }),
      });
      if (response.ok) {
        setCreateDialogOpen(false);
        setFormData({ name: "", description: "" });
        fetchTeams();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create team");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setFormData({ name: team.name, description: team.description || "" });
    setEditDialogOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !formData.name.trim()) {
      setError("Team name is required");
      return;
    }
    setUpdating(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: selectedTeam.id, ...formData }),
      });
      if (response.ok) {
        setEditDialogOpen(false);
        fetchTeams();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update team");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTeamScore = async () => {
    if (!selectedTeam || !scoreForm.amount || !scoreForm.reason.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setUpdating(true);
    try {
      const response = await fetch("/api/team-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-team-score",
          team_id: selectedTeam.id,
          amount: parseInt(scoreForm.amount as any),
          reason: scoreForm.reason,
        }),
      });
      if (response.ok) {
        setScoreDialogOpen(false);
        setScoreForm({ amount: 0, reason: "" });
        setError("");
        await fetchTeamScores();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add score");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    setUpdating(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: selectedTeam.id }),
      });
      if (response.ok) {
        setDeleteDialogOpen(false);
        fetchTeams();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete team");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleScoreClick = (team: Team) => {
    setSelectedTeam(team);
    setScoreForm({ amount: 0, reason: "" });
    setError("");
    setScoreDialogOpen(true);
  };

  const getTeamScore = (teamId: string) => {
    return teamScores.get(teamId) || 0;
  };

  const getTeamMemberCount = (teamName: string) => {
    return teamMembers.get(teamName) || 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teams Management</h1>
          <p className="text-gray-400">Create, manage teams and distribute scores</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">+ Create Team</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Team Name</Label>
                <Input
                  placeholder="Enter team name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Team description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateTeam}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updating ? "Creating..." : "Create"}
                </Button>
                <Button onClick={() => setCreateDialogOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded">{error}</div>}

      {/* Teams Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Teams ({teams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No teams created yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Team Name</TableHead>
                  <TableHead className="text-gray-300">Members</TableHead>
                  <TableHead className="text-gray-300">Score</TableHead>
                  <TableHead className="text-gray-300">Description</TableHead>
                  <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium text-white">{team.name}</TableCell>
                    <TableCell className="text-gray-300">{getTeamMemberCount(team.name)}</TableCell>
                    <TableCell className="text-yellow-400 font-semibold">{getTeamScore(team.id)}</TableCell>
                    <TableCell className="text-gray-400">{team.description || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScoreClick(team)}
                        className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                      >
                        Add Score
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTeam(team)}
                        className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTeam(team);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Team Scores Leaderboard */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Team Rankings (Team Competition Scores)</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No teams created yet</div>
          ) : (
            <div className="space-y-3">
              {teams
                .map((team) => ({
                  ...team,
                  score: getTeamScore(team.id),
                  memberCount: getTeamMemberCount(team.name),
                }))
                .sort((a, b) => b.score - a.score)
                .map((team, idx) => (
                  <div key={team.id} className="flex items-center justify-between bg-slate-700/50 p-4 rounded">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-yellow-400">#{idx + 1}</div>
                      <div>
                        <div className="text-white font-semibold">{team.name}</div>
                        <div className="text-gray-400 text-sm">{team.memberCount} members</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-400">{team.score}</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Team Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div>
                <Label>Team Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdateTeam}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updating ? "Updating..." : "Update"}
                </Button>
                <Button onClick={() => setEditDialogOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Score Dialog */}
      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Score to {selectedTeam?.name}</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div>
                <Label>Score Amount</Label>
                <Input
                  type="number"
                  value={scoreForm.amount}
                  onChange={(e) => setScoreForm({ ...scoreForm, amount: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter points to add (or negative to subtract)"
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Input
                  value={scoreForm.reason}
                  onChange={(e) => setScoreForm({ ...scoreForm, reason: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Why are you adding this score?"
                />
              </div>

              {/* Show team score preview */}
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Team Scores (Team Competition)</strong>
                </p>
                <p className="text-gray-400 text-sm">
                  Current team score: <strong className="text-yellow-400">{getTeamScore(selectedTeam.id)}</strong>
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  New team score: <strong className="text-green-400">{getTeamScore(selectedTeam.id) + scoreForm.amount}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ℹ️ This affects only the team's competition score, NOT individual user scores
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddTeamScore}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updating ? "Adding..." : "Add Score"}
                </Button>
                <Button onClick={() => setScoreDialogOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to delete <strong>{selectedTeam.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleDeleteTeam}
                  disabled={updating}
                  variant="destructive"
                >
                  {updating ? "Deleting..." : "Delete"}
                </Button>
                <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
