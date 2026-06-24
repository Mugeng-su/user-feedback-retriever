import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings";
import { settingsInputSchema } from "@/lib/schema";

export async function GET() {
  const settings = await getSettings();

  return NextResponse.json({
    ...settings,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasYouTubeKey: Boolean(process.env.YOUTUBE_API_KEY)
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = settingsInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid settings payload.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const settings = await saveSettings(parsed.data);

  return NextResponse.json({
    ...settings,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasYouTubeKey: Boolean(process.env.YOUTUBE_API_KEY)
  });
}
