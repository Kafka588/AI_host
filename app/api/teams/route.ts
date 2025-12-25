import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { data: teams, error } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ teams });
  } catch (e) {
    console.error("/api/teams GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, name, description } = body;

    if (action === "create") {
      if (!name) {
        return Response.json({ error: "Team name is required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("teams")
        .insert({ name, description })
        .select()
        .single();

      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ team: data });
    }

    if (action === "update") {
      if (!id) {
        return Response.json({ error: "Team ID is required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("teams")
        .update({ name, description })
        .eq("id", id)
        .select()
        .single();

      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ team: data });
    }

    if (action === "delete") {
      if (!id) {
        return Response.json({ error: "Team ID is required" }, { status: 400 });
      }

      // Check if team has members
      const { data: members, error: membersError } = await supabase
        .from("users")
        .select("id")
        .eq("team", id)
        .limit(1);

      if (membersError) return Response.json({ error: membersError.message }, { status: 400 });

      if (members && members.length > 0) {
        return Response.json(
          { error: "Cannot delete team with members. Move members to another team first." },
          { status: 400 }
        );
      }

      const { error: deleteError } = await supabase.from("teams").delete().eq("id", id);

      if (deleteError) return Response.json({ error: deleteError.message }, { status: 400 });
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("/api/teams POST error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
