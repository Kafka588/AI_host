"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeaderboardUser = {
  name: string;
  score: number;
  profile_pic_url: string | null;
};

type LeaderboardTeam = {
  id: string;
  name: string;
  score: number;
};

type VotingNominee = {
  id: string;
  name: string;
  photo_url: string | null;
  voteCount: number;
};

function Board({ 
  title, 
  items 
}: { 
  title: string; 
  items: LeaderboardUser[] | LeaderboardTeam[];
}) {
  const isUserBoard = items.length > 0 && 'profile_pic_url' in items[0];
  
  return (
    <Card className="w-full bg-[#2d2d2d] border-none">
      <CardHeader>
        <CardTitle className="text-lg text-[#dcdcdc]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-2">
        {items.length === 0 ? (
          <div className="text-center text-[#dcdcdc]">No data yet</div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg border px-4 py-3 bg-[#454545] border-none text-[#dcdcdc]"
            >
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center font-semibold flex-shrink-0">
                  {isUserBoard && (item as LeaderboardUser).profile_pic_url ? (
                    <img 
                      src={(item as LeaderboardUser).profile_pic_url!} 
                      alt={item.name}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    i + 1
                  )}
                </div>
                <div>
                  <div className="text-[#dcdcdc]">{item.name}</div>
                </div>
              </div>
              <div className="text-xl font-bold text-[#FFD700]">{item.score}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function VotingBoard({ 
  title, 
  items,
  icon
}: { 
  title: string; 
  items: VotingNominee[];
  icon: string;
}) {
  return (
    <Card className="w-full bg-[#2d2d2d] border-none">
      <CardHeader>
        <CardTitle className="text-lg text-[#dcdcdc]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-2">
        {items.length === 0 ? (
          <div className="text-center text-[#dcdcdc]">No nominees yet</div>
        ) : (
          items.map((nominee, i) => (
            <div
              key={nominee.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3 bg-[#454545] border-none text-[#dcdcdc]"
              style={i === 0 ? { 
                background: "var(--primary-300)", 
                borderColor: "var(--primary-100)",
                borderWidth: 2 
              } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
                  {nominee.photo_url ? (
                    <img 
                      src={nominee.photo_url} 
                      alt={nominee.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{icon}</span>
                  )}
                </div>
                <div>
                  <div className="text-[#dcdcdc] font-medium">{nominee.name}</div>
                  <div className="text-sm text-[#929292]">{nominee.voteCount} votes</div>
                </div>
              </div>
              {i === 0 && (
                <div className="text-2xl">👑</div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function ScoreboardPage() {
  const { user } = useAuth();
  const [princessNominees, setPrincessNominees] = useState<VotingNominee[]>([]);
  const [princeNominees, setPrinceNominees] = useState<VotingNominee[]>([]);
  const [sweaterNominees, setSweaterNominees] = useState<VotingNominee[]>([]);
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [userScore, setUserScore] = useState(0);
  const [teamScore, setTeamScore] = useState(0);
  const [teamName, setTeamName] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch voting results for all users
        const votesResponse = await fetch("/api/votes");
        const votesData = await votesResponse.json();
        
        if (votesResponse.ok) {
          const nominees = votesData.nominees || [];
          
          // Separate and sort by vote count
          const princessList = nominees
            .filter((n: any) => n.category === "princess")
            .sort((a: any, b: any) => b.voteCount - a.voteCount)
            .map((n: any) => ({
              id: n.id,
              name: n.name,
              photo_url: n.photo_url,
              voteCount: n.voteCount,
            }));
          
          const princeList = nominees
            .filter((n: any) => n.category === "prince")
            .sort((a: any, b: any) => b.voteCount - a.voteCount)
            .map((n: any) => ({
              id: n.id,
              name: n.name,
              photo_url: n.photo_url,
              voteCount: n.voteCount,
            }));
          
          const sweaterList = nominees
            .filter((n: any) => n.category === "ugly_sweater")
            .sort((a: any, b: any) => b.voteCount - a.voteCount)
            .map((n: any) => ({
              id: n.id,
              name: n.name,
              photo_url: n.photo_url,
              voteCount: n.voteCount,
            }));
          
          setPrincessNominees(princessList);
          setPrinceNominees(princeList);
          setSweaterNominees(sweaterList);
        }

        // Fetch task leaderboard for teams and user scores
        const leaderboardResponse = await fetch("/api/leaderboard");
        const leaderboardData = await leaderboardResponse.json();
        
        if (leaderboardResponse.ok) {
          setTeams(leaderboardData.teams || []);

          // Find current user's score
          if (user) {
            const allUsers = [...(leaderboardData.princess || []), ...(leaderboardData.prince || [])];
            const currentUserData = allUsers.find((u: any) => u.name === user.username);
            if (currentUserData) {
              setUserScore(currentUserData.score);
            }

            // Find team score
            const userTeam = leaderboardData.teams?.find(
              (t: any) => t.id === user.team
            );
            if (userTeam) {
              setTeamScore(userTeam.score);
              setTeamName(userTeam.name);
            } else {
              setTeamName(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data immediately on mount
    fetchData();

    // Set up real-time polling - refresh every 3 seconds
    const interval = setInterval(fetchData, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-6 text-black">
      {/* User Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="w-full bg-[#454545] border-none">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-white mb-1">Your Score</div>
              <div className="text-3xl font-bold text-[#FFD700]">{userScore}</div>
              <div className="text-xs text-[#929292] mt-1">{user?.username || "Guest"}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full bg-[#FFD700] border-none">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-[#c49216] mb-1">Team Score</div>
              <div className="text-3xl font-bold text-[#5e3b00]">{teamScore}</div>
              <div className="text-xs text-[#917800] mt-1">{teamName || user?.team || "No Team"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center items-center">
        <div className="space-y-4">
          <div className="text-[#dcdcdc] text-center text-2xl font-bold">Санал Өгөх</div>
          <a className="bg-[#FFD700] rounded-xl py-4 px-6 inline-block text-center font-bold text-[#5e3b00] w-full" href="/user/vote">Санал өгөх</a>
        </div>
      </div>

      <VotingBoard title="👑 Princess of the Night" items={princessNominees} icon="👸" /> 
      <VotingBoard title="🤴 Prince of the Night" items={princeNominees} icon="🤴" />
      <VotingBoard title="🧶 Best Ugly Sweater" items={sweaterNominees} icon="🧶" />
      <Board title="📝 Tasks Leaderboard" items={teams} />
    </div>
  );
}