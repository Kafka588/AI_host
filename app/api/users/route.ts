import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    // Get all non-admin users
    const { data, error } = await supabase
      .from("users")
      .select("id, username, sex, team, is_admin, profile_pic_url")
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ users: data || [] });
  } catch (e) {
    console.error("/api/users GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, username, sex, team } = await req.json();

    if (!id) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ username, sex, team })
      .eq("id", id)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true, user: data });
  } catch (e) {
    console.error("/api/users PUT error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true });
  } catch (e) {
    console.error("/api/users DELETE error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
