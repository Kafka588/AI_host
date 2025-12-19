import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const avatarDir = path.join(process.cwd(), "public", "Avatar");
    const files = fs.readdirSync(avatarDir);
    
    // Filter video files only
    const videos = files
      .filter((file) => /\.(mp4|webm|mov)$/i.test(file))
      .map((file) => `/Avatar/${file}`);
    
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json({ videos: [] }, { status: 500 });
  }
}