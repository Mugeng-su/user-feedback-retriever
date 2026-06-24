import { NextResponse } from "next/server";
import { createAnalysis, getAnalysis } from "@/lib/analysis-store";
import { runAnalysis } from "@/lib/analyzer";
import { formatAnalysisError } from "@/lib/error-messages";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(_request: Request, { params }: RouteContext) {
  const existing = await getAnalysis(params.id);

  if (!existing) {
    return NextResponse.json({ message: "Analysis not found." }, { status: 404 });
  }

  const input = {
    id: existing.id,
    title: existing.title,
    platform: existing.platform,
    videoUrl: existing.videoUrl ?? undefined,
    productName: existing.productName ?? undefined,
    creatorName: existing.creatorName ?? undefined,
    views: existing.views ?? undefined,
    likes: existing.likes ?? undefined,
    commentsCount: existing.commentsCount ?? undefined,
    shares: existing.shares ?? undefined,
    saves: existing.saves ?? undefined,
    transcript: existing.transcript,
    commentsRaw: existing.commentsRaw,
    language: existing.language ?? undefined,
    status: "processing" as const,
    providerUsed: existing.providerUsed ?? undefined,
    resultJson: existing.resultJson ?? undefined
  };

  try {
    const execution = await runAnalysis(input);

    await createAnalysis({
      ...input,
      status: "completed",
      providerUsed: execution.provider,
      resultJson: execution.result
    });

    return NextResponse.json({ id: existing.id, status: "completed" });
  } catch (error) {
    const displayError = formatAnalysisError(error);
    const hasPreviousResult = Boolean(existing.resultJson);

    await createAnalysis({
      ...input,
      status: hasPreviousResult ? "completed" : "failed",
      providerUsed: existing.providerUsed ?? undefined,
      resultJson: existing.resultJson ?? undefined,
      errorMessage: `${displayError.title}: ${displayError.message} ${displayError.suggestion}`
    });

    return NextResponse.json(
      {
        id: existing.id,
        status: "failed",
        ...displayError
      },
      { status: 500 }
    );
  }
}
