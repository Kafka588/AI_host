import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Submissions fetch error:", error);
      return Response.json({ error: error.message }, { status: 400 });
    }

    // Fetch user profile pictures separately if needed
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((d: any) => d.user_id))];
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, profile_pic_url")
        .in("id", userIds);

      const userProfileMap = new Map();
      users?.forEach((u: any) => {
        userProfileMap.set(u.id, u.profile_pic_url);
      });

      const enrichedData = data.map((item: any) => ({
        ...item,
        user_profile_pic: userProfileMap.get(item.user_id) || null,
      }));

      return Response.json({ submissions: enrichedData });
    }

    return Response.json({ submissions: data });
  } catch (e) {
    console.error("/api/submissions GET error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, id, status, userId, userName, taskId, taskTitle, proofImage } = await req.json();

    if (action === "create") {
      if (!userId || !taskId || !proofImage) {
        return Response.json({ error: "User ID, Task ID, and Proof Image required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("submissions")
        .insert([
          {
            user_id: userId,
            user_name: userName,
            task_id: taskId,
            task_title: taskTitle,
            proof_image: proofImage,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ submission: data });
    }

    if (action === "update-status") {
      if (!id || !status) {
        return Response.json({ error: "Submission ID and status required" }, { status: 400 });
      }

      // Get the submission to find the task_id
      const { data: submission, error: fetchError } = await supabase
        .from("submissions")
        .select("task_id")
        .eq("id", id)
        .single();

      if (fetchError) return Response.json({ error: fetchError.message }, { status: 400 });

      // If approving, reject all other submissions for this task
      if (status === "approved" && submission?.task_id) {
        await supabase
          .from("submissions")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("task_id", submission.task_id)
          .neq("id", id)
          .in("status", ["pending"]);
      }

      const { data, error } = await supabase
        .from("submissions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ submission: data });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("/api/submissions POST error", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
