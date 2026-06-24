import { NextResponse } from "next/server";
import { createAnalysis } from "@/lib/analysis-store";
import { runAnalysis } from "@/lib/analyzer";
import { formatAnalysisError, formatValidationIssues } from "@/lib/error-messages";
import { analysisInputSchema } from "@/lib/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = analysisInputSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = formatValidationIssues(parsed.error.flatten().fieldErrors);

    return NextResponse.json(
      {
        title: "Invalid analysis input",
        message: fieldErrors || "Some required fields are missing or too short.",
        suggestion:
          "Check the video title, platform, transcript, and comments. Transcript must be at least 40 characters and comments at least 20 characters.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const created = await createAnalysis(parsed.data);

  try {
    const execution = await runAnalysis(parsed.data);
    const updated = await createAnalysis({
      ...parsed.data,
      id: created.id,
      status: "completed",
      providerUsed: execution.provider,
      resultJson: execution.result
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status
    });
  } catch (error) {
    const displayError = formatAnalysisError(error);

    await createAnalysis({
      ...parsed.data,
      id: created.id,
      status: "failed",
      providerUsed: undefined,
      errorMessage: `${displayError.title}: ${displayError.message} ${displayError.suggestion}`
    });

    return NextResponse.json(
      {
        id: created.id,
        status: "failed",
        ...displayError
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use the app UI to browse saved analyses." });
}
