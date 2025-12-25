import { supabase } from "@/lib/supabase";

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl && publicUrl.length > 0) {
    const needsSlash = !publicUrl.endsWith("/") && !url.startsWith("/");
    return `${publicUrl}${needsSlash ? "/" : ""}${url}`;
  }
  return url;
}

export async function GET(req: Request) {
  try {
    // Get all non-admin users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, sex, profile_pic_url, is_admin, team")
      .eq("is_admin", false);

    if (usersError) return Response.json({ error: usersError.message }, { status: 400 });

    // Get submission counts for each user
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("user_id, task_id, status");

    if (submissionsError) return Response.json({ error: submissionsError.message }, { status: 400 });

    // Get all tasks with scores
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, score");

    if (tasksError) return Response.json({ error: tasksError.message }, { status: 400 });

    // Get INDIVIDUAL score transactions (user bonuses/penalties only)
    const { data: userTransactions, error: userTransError } = await supabase
      .from("score_transactions")
      .select("user_id, amount");

    if (userTransError) return Response.json({ error: userTransError.message }, { status: 400 });

    // Get TEAM score transactions (team competition scores)
    const { data: teamTransactions, error: teamTransError } = await supabase
      .from("team_score_transactions")
      .select("team_id, amount");

    if (teamTransError) return Response.json({ error: teamTransError.message }, { status: 400 });

    // Create task score map
    const taskScoreMap = new Map();
    tasks?.forEach((task: any) => {
      taskScoreMap.set(task.id, task.score || 10);
    });

    // Create user transaction score map (individual bonuses)
    const userTransactionScoreMap = new Map();
    userTransactions?.forEach((trans: any) => {
      if (trans.user_id) {
        const current = userTransactionScoreMap.get(trans.user_id) || 0;
        userTransactionScoreMap.set(trans.user_id, current + trans.amount);
      }
    });

    // Create team transaction score map (team competition scores)
    const teamTransactionScoreMap = new Map();
    teamTransactions?.forEach((trans: any) => {
      if (trans.team_id) {
        const current = teamTransactionScoreMap.get(trans.team_id) || 0;
        teamTransactionScoreMap.set(trans.team_id, current + trans.amount);
      }
    });

    // Calculate INDIVIDUAL user scores
    const userScores = (users || []).map((user: any) => {
      const userSubmissions = (submissions || []).filter(
        (s: any) => s.user_id === user.id && s.status === "approved"
      );
      const taskScoreTotal = userSubmissions.reduce((sum: number, sub: any) => {
        const taskScore = taskScoreMap.get(sub.task_id) || 10;
        return sum + taskScore;
      }, 0);
      // Add individual bonuses/penalties
      const userBonusScore = userTransactionScoreMap.get(user.id) || 0;
      const totalUserScore = taskScoreTotal + userBonusScore;
      return {
        id: user.id,
        name: user.username || "Unknown",
        sex: user.sex,
        profile_pic_url: normalizeUrl(user.profile_pic_url),
        team: user.team,
        score: totalUserScore,
      };
    });

    // Separate by sex and sort
    const princess = userScores
      .filter((u) => u.sex === "female")
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const prince = userScores
      .filter((u) => u.sex === "male")
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Get TEAM scores from team_scores table and transactions
    const { data: teamScoresData } = await supabase
      .from("team_scores")
      .select("team_id, score");

    const teamScoreMap = new Map();
    teamScoresData?.forEach((ts: any) => {
      teamScoreMap.set(ts.team_id, ts.score || 0);
    });

    // Get teams list
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, name");

    const teams = (teamsData || [])
      .map((team: any) => {
        const members = userScores.filter((u) => u.team === team.id);
        const memberScoreTotal = members.reduce((sum, m) => sum + (m.score || 0), 0);
        const teamScore = (teamScoreMap.get(team.id) || 0) + memberScoreTotal;
        return {
          id: team.id,
          name: team.name,
          score: teamScore,
          memberCount: members.length,
        };
      })
      .sort((a: any, b: any) => b.score - a.score);

    return Response.json({ princess, prince, teams });
  } catch (e) {
    console.error("/api/leaderboard GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
