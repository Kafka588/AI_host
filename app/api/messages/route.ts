import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { data, error } = await supabase
      .from("warm_messages")
      .select(`
        id,
        message,
        from_user:from_user_id (id, username, profile_pic_url),
        to_user:to_user_id (id, username),
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ messages: data || [] });
  } catch (e) {
    console.error("/api/messages GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { from_user_id, to_user_id, message } = await req.json();

    if (!from_user_id || !to_user_id || !message) {
      return Response.json({ error: "All fields required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("warm_messages")
      .insert([
        {
          from_user_id,
          to_user_id,
          message,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true, message: data });
  } catch (e) {
    console.error("/api/messages POST error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
