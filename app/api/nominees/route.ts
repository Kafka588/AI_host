import { NextResponse } from "next/server";

// GET: Fetch all nominees
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const response = await fetch(`${baseUrl}/rest/v1/nominees?select=*&order=category.asc,name.asc`, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch nominees");
    }

    const nominees = await response.json();
    return NextResponse.json({ nominees });
  } catch (error: any) {
    console.error("Error fetching nominees:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch nominees" },
      { status: 500 }
    );
  }
}

// POST: Add a new nominee (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, userId, photoUrl } = body;

    if (!name || !category || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["princess", "prince"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be 'princess' or 'prince'" },
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

    const response = await fetch(`${baseUrl}/rest/v1/nominees`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name,
        category,
        user_id: userId,
        photo_url: photoUrl || null,
        created_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create nominee");
    }

    const nominee = await response.json();
    return NextResponse.json({ success: true, nominee });
  } catch (error: any) {
    console.error("Error creating nominee:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create nominee" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a nominee (admin only)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Nominee ID is required" },
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

    const response = await fetch(`${baseUrl}/rest/v1/nominees?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete nominee");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting nominee:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete nominee" },
      { status: 500 }
    );
  }
}
