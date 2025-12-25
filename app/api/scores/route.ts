import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");

    // Get score transactions (ONLY USER SCORES)
    let query = supabase
      .from("score_transactions")
      .select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ transactions: data });
  } catch (e) {
    console.error("/api/scores GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, user_id, amount, reason } = body;

    if (action === "add-user-score") {
      if (!user_id || amount === undefined || !reason) {
        return Response.json({ error: "Missing required fields: user_id, amount, reason" }, { status: 400 });
      }

      // Add transaction record for USER ONLY
      const { error: transError } = await supabase
        .from("score_transactions")
        .insert({
          user_id,
          amount,
          reason,
        });

      if (transError) return Response.json({ error: transError.message }, { status: 400 });
      return Response.json({ success: true, message: `Added ${amount} points to user` });
    }

    return Response.json({ error: "Invalid action. Use 'add-user-score'" }, { status: 400 });
  } catch (e) {
    console.error("/api/scores POST error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
