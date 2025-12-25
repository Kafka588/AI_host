"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

type Team = {
  id: string;
  name: string;
  description?: string;
};

type User = {
  id: string;
  username: string;
  team: string;
  sex: string;
  profile_pic_url?: string | null;
};

type TeamMember = {
  id: string;
  username: string;
  sex: string;
  profile_pic_url?: string | null;
  score: number;
};

type TeamWithMembers = {
  team: Team;
  members: TeamMember[];
  teamScore: number;
  totalMemberScore: number;
};

export default function AllTeamsPage() {
  const [teamsData, setTeamsData] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [scoreForm, setScoreForm] = useState({ amount: 0, reason: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTeamsWithMembers();
  }, []);

  const fetchTeamsWithMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch teams
      const teamsRes = await fetch("/api/teams");
      const teamsData = await teamsRes.json();
      const teams = teamsData.teams || [];

      // Fetch all users
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      const allUsers = usersData.users || [];

      // Fetch leaderboard for user scores
      const leaderboardRes = await fetch("/api/leaderboard");
      const leaderboardData = await leaderboardRes.json();
      
      const userScoreMap = new Map();
      [...(leaderboardData.princess || []), ...(leaderboardData.prince || [])].forEach((u: any) => {
        userScoreMap.set(u.id, u.score);
      });

      // Fetch team scores
      const teamScoresRes = await fetch("/api/team-scores");
      const teamScoresData = await teamScoresRes.json();
      
      // Process teams with scores
      const processedTeams = teams.map((team: Team) => {
        const teamScore = (teamScoresData.transactions || []).reduce((sum: number, trans: any) => {
          return trans.team_id === team.id ? sum + trans.amount : sum;
        }, 0);
        return { ...team, teamScore };
      });

      // Group users by team
      const result: TeamWithMembers[] = processedTeams.map((team: any) => {
        const members: TeamMember[] = allUsers
          .filter((u: User) => u.team === team.name)
          .map((u: User) => ({
            id: u.id,
            username: u.username,
            sex: u.sex,
            profile_pic_url: u.profile_pic_url,
            score: userScoreMap.get(u.id) || 0,
          }))
          .sort((a: TeamMember, b: TeamMember) => b.score - a.score);

        const totalMemberScore = members.reduce((sum: number, m: TeamMember) => sum + m.score, 0);

        return {
          team,
          members,
          teamScore: team.teamScore,
          totalMemberScore,
        };
      });

      // Sort by team score
      result.sort((a: TeamWithMembers, b: TeamWithMembers) => b.teamScore - a.teamScore);
      setTeamsData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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
        await fetchTeamsWithMembers();
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

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setEditForm({ name: team.name, description: team.description || "" });
    setError("");
    setEditDialogOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !editForm.name.trim()) {
      setError("Team name is required");
      return;
    }
    setUpdating(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: selectedTeam.id,
          name: editForm.name,
          description: editForm.description,
        }),
      });
      if (response.ok) {
        setEditDialogOpen(false);
        setError("");
        await fetchTeamsWithMembers();
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

  const handleScoreClick = (team: Team) => {
    setSelectedTeam(team);
    setScoreForm({ amount: 0, reason: "" });
    setError("");
    setScoreDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-400">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">All Teams Overview</h1>
        <p className="text-gray-400">View all teams with member scores and team competition scores</p>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded">{error}</div>}

      {teamsData.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12">
            <div className="text-center text-gray-400">No teams created yet</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teamsData.map((teamData, idx) => (
            <Card key={teamData.team.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="bg-slate-900/50 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl font-bold text-yellow-400">#{idx + 1}</div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-2xl">{teamData.team.name}</CardTitle>
                      {teamData.team.description && (
                        <p className="text-gray-400 text-sm mt-1">{teamData.team.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEditTeam(teamData.team)}
                      className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleScoreClick(teamData.team)}
                      className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                    >
                      Add Score
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-700/50 p-4 rounded">
                    <div className="text-gray-400 text-sm">Team Competition Score</div>
                    <div className="text-3xl font-bold text-green-400 mt-1">{teamData.teamScore}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded">
                    <div className="text-gray-400 text-sm">Team Members</div>
                    <div className="text-3xl font-bold text-blue-400 mt-1">{teamData.members.length}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded">
                    <div className="text-gray-400 text-sm">Total Member Score</div>
                    <div className="text-3xl font-bold text-purple-400 mt-1">{teamData.totalMemberScore}</div>
                  </div>
                </div>

                {teamData.members.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No members in this team</div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold mb-3">Team Members</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {teamData.members.map((member, memberIdx) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between bg-slate-700/30 p-3 rounded hover:bg-slate-700/50 transition"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-gray-400 font-semibold w-6">{memberIdx + 1}.</div>
                            {member.profile_pic_url ? (
                              <img
                                src={member.profile_pic_url}
                                alt={member.username}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                                👤
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-white font-medium">{member.username}</div>
                              <div className="text-gray-400 text-xs">
                                {member.sex === "male" ? "🙎‍♂️ Male" : "🙎‍♀️ Female"}
                              </div>
                            </div>
                          </div>
                          <div className="text-yellow-400 font-bold text-lg">{member.score}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Team Score Dialog */}
      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Competition Score</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4">
              <div>
                <Label>Team: {selectedTeam.name}</Label>
              </div>
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
              <div className="bg-slate-700/50 p-3 rounded text-sm">
                <p className="text-gray-300">
                  This affects the <strong>team competition score</strong> only, not individual member scores.
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
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Team description"
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
    </div>
  );
}
