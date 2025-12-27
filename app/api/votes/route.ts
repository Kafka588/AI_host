import { NextResponse } from "next/server";

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  // Already an app-relative proxy or absolute URL
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) return url;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl && publicUrl.length > 0) {
    const needsSlash = !publicUrl.endsWith("/") && !url.startsWith("/");
    return `${publicUrl}${needsSlash ? "/" : ""}${url}`;
  }
  return url;
}

// GET: Fetch all users (nominees) and optionally user's votes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    // Fetch all non-admin users (these are the nominees)
    const usersResponse = await fetch(
      `${baseUrl}/rest/v1/users?is_admin=eq.false&select=id,username,sex,profile_pic_url`,
      {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!usersResponse.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await usersResponse.json();

    // Fetch vote counts for each user by category
    const votesResponse = await fetch(
      `${baseUrl}/rest/v1/votes?select=voted_for_user_id,category`,
      {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const votes = votesResponse.ok ? await votesResponse.json() : [];
    
    // Count votes per user per category
    const voteCounts: Record<string, number> = {};
    votes.forEach((vote: { voted_for_user_id: string; category: string }) => {
      const key = `${vote.voted_for_user_id}-${vote.category}`;
      voteCounts[key] = (voteCounts[key] || 0) + 1;
    });

    // Attach vote counts to users (with separate entries for each category)
    const usersWithVotes = users.flatMap((user: any) => {
      const userCategory = user.sex === "male" ? "prince" : "princess";
      return [
        {
          id: user.id,
          name: user.username,
          sex: user.sex,
          photo_url: normalizeUrl(user.profile_pic_url),
          voteCount: voteCounts[`${user.id}-${userCategory}`] || 0,
          category: userCategory,
        },
        {
          id: user.id,
          name: user.username,
          sex: user.sex,
          photo_url: normalizeUrl(user.profile_pic_url),
          voteCount: voteCounts[`${user.id}-ugly_sweater`] || 0,
          category: "ugly_sweater",
        },
      ];
    });

    // If userId provided, fetch user's votes
    let userVotes: any[] = [];
    if (userId) {
      const userVotesResponse = await fetch(
        `${baseUrl}/rest/v1/votes?voter_user_id=eq.${userId}&select=*`,
        {
          headers: {
            apikey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      if (userVotesResponse.ok) {
        userVotes = await userVotesResponse.json();
      }
    }

    return NextResponse.json({
      nominees: usersWithVotes,
      userVotes,
    });
  } catch (error: any) {
    console.error("Error fetching nominees:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch nominees" },
      { status: 500 }
    );
  }
}

// POST: Submit a vote
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { voterId, votedForUserId, category } = body;

    if (!voterId || !votedForUserId || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user is voting for themselves
    if (voterId === votedForUserId) {
      return NextResponse.json(
        { error: "You cannot vote for yourself" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    // Check if user already voted in this category
    const existingVoteResponse = await fetch(
      `${baseUrl}/rest/v1/votes?voter_user_id=eq.${voterId}&category=eq.${category}`,
      {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const existingVotes = await existingVoteResponse.json();

    if (existingVotes.length > 0) {
      return NextResponse.json(
        { error: `You have already voted for ${category}` },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["princess", "prince", "ugly_sweater"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Submit the vote
    const voteResponse = await fetch(`${baseUrl}/rest/v1/votes`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        voter_user_id: voterId,
        voted_for_user_id: votedForUserId,
        category,
        created_at: new Date().toISOString(),
      }),
    });

    if (!voteResponse.ok) {
      let errorData: any = null;
      try {
        errorData = await voteResponse.json();
      } catch (parseErr) {
        // ignore parse errors; fallback to text
      }
      const message = errorData?.message || errorData?.error || "Failed to submit vote";
      return NextResponse.json({ error: message, details: errorData }, { status: voteResponse.status || 400 });
    }

    const vote = await voteResponse.json();

    return NextResponse.json({ success: true, vote });
  } catch (error: any) {
    console.error("Error submitting vote:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit vote" },
      { status: 500 }
    );
  }
}
