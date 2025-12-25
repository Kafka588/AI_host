import { uploadBase64ImageToR2 } from "@/lib/r2";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Migrate existing images from Supabase to R2
 * POST /api/migrate-images { dryRun?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const { dryRun = false } = await req.json();
    
    const results = {
      tasks: { total: 0, migrated: 0, failed: 0, skipped: 0 },
      submissions: { total: 0, migrated: 0, failed: 0, skipped: 0 },
      profiles: { total: 0, migrated: 0, failed: 0, skipped: 0 },
      errors: [] as string[],
    };

    // Migrate task images
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, image_url")
      .not("image_url", "is", null);

    if (tasksError) {
      throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
    }

    results.tasks.total = tasks?.length || 0;

    for (const task of tasks || []) {
      try {
        // Skip if already on R2
        if (task.image_url?.includes(process.env.R2_PUBLIC_URL || "r2.dev")) {
          results.tasks.skipped++;
          continue;
        }

        // Skip if not base64
        if (!task.image_url?.startsWith("data:image")) {
          results.tasks.skipped++;
          continue;
        }

        if (!dryRun) {
          // Upload to R2
          const r2Url = await uploadBase64ImageToR2(
            task.image_url,
            "tasks",
            `${task.id}-${Date.now()}.jpg`
          );

          // Update database
          const { error: updateError } = await supabase
            .from("tasks")
            .update({ image_url: r2Url })
            .eq("id", task.id);

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }
        }

        results.tasks.migrated++;
      } catch (err) {
        results.tasks.failed++;
        results.errors.push(`Task ${task.id}: ${(err as Error).message}`);
      }
    }

    // Migrate submission images
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("id, task_title, proof_image")
      .not("proof_image", "is", null);

    if (submissionsError) {
      throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
    }

    results.submissions.total = submissions?.length || 0;

    for (const submission of submissions || []) {
      try {
        // Skip if already on R2
        if (submission.proof_image?.includes(process.env.R2_PUBLIC_URL || "r2.dev")) {
          results.submissions.skipped++;
          continue;
        }

        // Skip if not base64
        if (!submission.proof_image?.startsWith("data:image") && !submission.proof_image?.startsWith("data:video")) {
          results.submissions.skipped++;
          continue;
        }

        if (!dryRun) {
          // Upload to R2
          const r2Url = await uploadBase64ImageToR2(
            submission.proof_image,
            "submissions",
            `${submission.id}-${Date.now()}.jpg`
          );

          // Update database
          const { error: updateError } = await supabase
            .from("submissions")
            .update({ proof_image: r2Url })
            .eq("id", submission.id);

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }
        }

        results.submissions.migrated++;
      } catch (err) {
        results.submissions.failed++;
        results.errors.push(`Submission ${submission.id}: ${(err as Error).message}`);
      }
    }

    // Migrate profile pictures
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, profile_pic_url")
      .not("profile_pic_url", "is", null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    results.profiles.total = users?.length || 0;

    for (const user of users || []) {
      try {
        // Skip if already on R2
        if (user.profile_pic_url?.includes(process.env.R2_PUBLIC_URL || "r2.dev")) {
          results.profiles.skipped++;
          continue;
        }

        // Skip if not base64
        if (!user.profile_pic_url?.startsWith("data:image")) {
          results.profiles.skipped++;
          continue;
        }

        if (!dryRun) {
          // Upload to R2
          const r2Url = await uploadBase64ImageToR2(
            user.profile_pic_url,
            "profiles",
            `${user.id}-${Date.now()}.jpg`
          );

          // Update database
          const { error: updateError } = await supabase
            .from("users")
            .update({ profile_pic_url: r2Url })
            .eq("id", user.id);

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }
        }

        results.profiles.migrated++;
      } catch (err) {
        results.profiles.failed++;
        results.errors.push(`User ${user.id}: ${(err as Error).message}`);
      }
    }

    return Response.json({
      success: true,
      dryRun,
      results,
      message: dryRun
        ? "Dry run completed - no changes made"
        : "Migration completed",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
