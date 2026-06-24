import type { AnalysisResult } from "@/lib/schema";

export type AnalysisExecution = {
  provider: "openai" | "gemini" | "mock" | "screening";
  result: AnalysisResult;
};
