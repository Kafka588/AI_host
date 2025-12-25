import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teamId = url.searchParams.get("team_id");

    // Get team score transactions
    let query = supabase
      .from("team_score_transactions")
      .select("*");

    if (teamId) {
      query = query.eq("team_id", teamId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ transactions: data });
  } catch (e) {
    console.error("/api/team-scores GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, team_id, amount, reason } = body;

    if (action === "add-team-score") {
      if (!team_id || amount === undefined || !reason) {
        return Response.json({ error: "Missing required fields: team_id, amount, reason" }, { status: 400 });
      }

      // Get or create team score record
      const { data: existingScore } = await supabase
        .from("team_scores")
        .select("id, score")
        .eq("team_id", team_id)
        .single();

      let newScore = (existingScore?.score || 0) + amount;

      if (existingScore) {
        // Update existing score
        const { error: updateError } = await supabase
          .from("team_scores")
          .update({ score: newScore, updated_at: new Date().toISOString() })
          .eq("id", existingScore.id);

        if (updateError) return Response.json({ error: updateError.message }, { status: 400 });
      } else {
        // Create new score record
        const { error: insertError } = await supabase
          .from("team_scores")
          .insert({
            team_id,
            score: newScore,
          });

        if (insertError) return Response.json({ error: insertError.message }, { status: 400 });
      }

      // Add transaction record for audit trail
      const { error: transError } = await supabase
        .from("team_score_transactions")
        .insert({
          team_id,
          amount,
          reason,
        });

      if (transError) return Response.json({ error: transError.message }, { status: 400 });

      return Response.json({ 
        success: true, 
        message: `Added ${amount} points to team`,
        newScore: newScore
      });
    }

    return Response.json({ error: "Invalid action. Use 'add-team-score'" }, { status: 400 });
  } catch (e) {
    console.error("/api/team-scores POST error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
