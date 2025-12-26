import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("id");

    if (taskId) {
      // Get single task
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ task: data });
    }

    // Get all tasks
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ tasks: data });
  } catch (e) {
    console.error("/api/tasks GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, explanation, imageUrl, score, action } = body;

    if (action === "create") {
      if (!title || !explanation) {
        return Response.json({ error: "Title and explanation required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            explanation,
            image_url: imageUrl || null,
            score: score || 10,
            is_public: body.isPublic === true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        const msg = (error as any).message || String(error);
        if (msg.toLowerCase().includes("is_public")) {
          return Response.json(
            {
              error:
                "Missing column is_public on tasks. Run: ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;",
            },
            { status: 400 }
          );
        }
        return Response.json({ error: msg }, { status: 400 });
      }
      return Response.json({ task: data });
    }

    if (action === "delete") {
      const { taskId } = await req.json();
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ success: true });
    }

    if (action === "update") {
      const { taskId, title, explanation, imageUrl } = body;
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title,
          explanation,
          image_url: imageUrl || null,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ task: data });
    }

    if (action === "update-visibility") {
      const { taskId, isPublic } = body;
      if (!taskId || typeof isPublic !== "boolean") {
        return Response.json({ error: "taskId and isPublic required" }, { status: 400 });
      }
      const { data, error } = await supabase
        .from("tasks")
        .update({ is_public: isPublic })
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        const msg = (error as any).message || String(error);
        if (msg.toLowerCase().includes("is_public")) {
          return Response.json(
            {
              error:
                "Missing column is_public on tasks. Run: ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;",
            },
            { status: 400 }
          );
        }
        return Response.json({ error: msg }, { status: 400 });
      }
      return Response.json({ task: data });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("/api/tasks POST error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
