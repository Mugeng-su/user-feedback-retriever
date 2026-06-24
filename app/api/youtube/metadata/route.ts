import { NextResponse } from "next/server";
import { fetchYouTubeMetadata } from "@/lib/youtube-metadata";

export async function POST(request: Request) {
  const body = await request.json();
  const videoUrl = typeof body?.videoUrl === "string" ? body.videoUrl : "";

  if (!videoUrl.trim()) {
    return NextResponse.json(
      {
        title: "YouTube URL is required",
        message: "Paste a YouTube video link before fetching metrics.",
        suggestion: "Supported links include youtube.com/watch, youtu.be, Shorts, embed, and live URLs."
      },
      { status: 400 }
    );
  }

  try {
    const metadata = await fetchYouTubeMetadata(videoUrl);

    return NextResponse.json(metadata);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const missingKey = message.includes("YOUTUBE_API_KEY");

    return NextResponse.json(
      {
        title: missingKey ? "YouTube API key is missing" : "Could not fetch YouTube metrics",
        message,
        suggestion: missingKey
          ? "Add YOUTUBE_API_KEY to .env, then restart the dev server."
          : "Check that the link is a public YouTube video and that the API key has YouTube Data API access."
      },
      { status: missingKey ? 500 : 400 }
    );
  }
}
