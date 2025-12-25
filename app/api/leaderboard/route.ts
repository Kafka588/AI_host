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

    // Create task score map
    const taskScoreMap = new Map();
    tasks?.forEach((task: any) => {
      taskScoreMap.set(task.id, task.score || 10);
    });

    // Calculate scores
    const userScores = (users || []).map((user: any) => {
      const userSubmissions = (submissions || []).filter(
        (s: any) => s.user_id === user.id && s.status === "approved"
      );
      const totalScore = userSubmissions.reduce((sum: number, sub: any) => {
        const taskScore = taskScoreMap.get(sub.task_id) || 10;
        return sum + taskScore;
      }, 0);
      return {
        id: user.id,
        name: user.username || "Unknown",
        sex: user.sex,
        profile_pic_url: normalizeUrl(user.profile_pic_url),
        team: user.team,
        score: totalScore,
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

    // Get team scores (non-admin users only)
    const teamScores = (userScores).reduce((acc: any, user: any) => {
      if (!user.team) return acc;
      acc[user.team] = (acc[user.team] || 0) + user.score;
      return acc;
    }, {});

    const teams = Object.entries(teamScores || {})
      .map(([name, score]) => ({ name, score }))
      .sort((a: any, b: any) => b.score - a.score);

    return Response.json({ princess, prince, teams });
  } catch (e) {
    console.error("/api/leaderboard GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
