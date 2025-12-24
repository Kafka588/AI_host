import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const taskId = searchParams.get("taskId");

    if (userId && taskId) {
      // Check if user has scanned this task
      const { data, error } = await supabase
        .from("task_scans")
        .select("id")
        .eq("user_id", userId)
        .eq("task_id", taskId)
        .single();

      if (error && error.code !== "PGRST116") {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({ scanned: !!data });
    }

    // Get all scanned tasks for a user
    const { data, error } = await supabase
      .from("task_scans")
      .select("task_id")
      .eq("user_id", userId);

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ scannedTasks: data?.map((s: any) => s.task_id) || [] });
  } catch (e) {
    console.error("/api/task-scans GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return Response.json({ error: "User ID and Task ID required" }, { status: 400 });
    }

    // Check if already scanned
    const { data: existing, error: checkError } = await supabase
      .from("task_scans")
      .select("id")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .single();

    if (existing) {
      return Response.json({ error: "Task already scanned" }, { status: 400 });
    }

    // Check if user already has an approved submission for this task
    const { data: approvedSubmission } = await supabase
      .from("submissions")
      .select("id")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .eq("status", "approved")
      .single();

    if (approvedSubmission) {
      return Response.json({ error: "You have already completed this task" }, { status: 400 });
    }

    // Record the scan
    const { data, error } = await supabase
      .from("task_scans")
      .insert([
        {
          user_id: userId,
          task_id: taskId,
          scanned_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true, scan: data });
  } catch (e) {
    console.error("/api/task-scans POST error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
