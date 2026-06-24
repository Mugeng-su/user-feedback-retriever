import { prisma } from "@/lib/prisma";
import type { AnalysisInput, AnalysisResult } from "@/lib/schema";

type StoredAnalysis = {
  id: string;
  title: string;
  platform: string;
  videoUrl: string | null;
  productName: string | null;
  creatorName: string | null;
  views: number | null;
  likes: number | null;
  commentsCount: number | null;
  shares: number | null;
  saves: number | null;
  transcript: string;
  commentsRaw: string;
  language: string | null;
  status: string;
  providerUsed: string | null;
  errorMessage: string | null;
  resultJson: AnalysisResult | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listAnalyses() {
  const analyses = await prisma.analysis.findMany({
    where: {
      status: {
        not: "failed"
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 12
  });

  return analyses.map(mapAnalysis);
}

export async function getAnalysis(id: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id }
  });

  return analysis ? mapAnalysis(analysis) : null;
}

export async function createAnalysis(input: AnalysisInput) {
  const data = {
    id: input.id,
    title: input.title,
    platform: input.platform,
    videoUrl: input.videoUrl ?? null,
    productName: input.productName ?? null,
    creatorName: input.creatorName ?? null,
    views: input.views ?? null,
    likes: input.likes ?? null,
    commentsCount: input.commentsCount ?? null,
    shares: input.shares ?? null,
    saves: input.saves ?? null,
    transcript: input.transcript,
    commentsRaw: input.commentsRaw,
    language: input.language ?? null,
    status: input.status ?? "processing",
    providerUsed: input.providerUsed ?? null,
    errorMessage: input.errorMessage ?? null,
    resultJson: input.resultJson ? JSON.stringify(input.resultJson) : null
  };

  if (input.id) {
    const updated = await prisma.analysis.upsert({
      where: { id: input.id },
      create: data,
      update: data
    });

    return mapAnalysis(updated);
  }

  const created = await prisma.analysis.create({
    data
  });

  return mapAnalysis(created);
}

function mapAnalysis(analysis: {
  id: string;
  title: string;
  platform: string;
  videoUrl: string | null;
  productName: string | null;
  creatorName: string | null;
  views: number | null;
  likes: number | null;
  commentsCount: number | null;
  shares: number | null;
  saves: number | null;
  transcript: string;
  commentsRaw: string;
  language: string | null;
  status: string;
  providerUsed: string | null;
  errorMessage: string | null;
  resultJson: string | null;
  createdAt: Date;
  updatedAt: Date;
}): StoredAnalysis {
  return {
    ...analysis,
    resultJson: analysis.resultJson
      ? (JSON.parse(analysis.resultJson) as AnalysisResult)
      : null
  };
}
