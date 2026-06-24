import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { buildAnalysisMessages } from "@/lib/analysis-prompt";
import { analysisResultSchema, type AnalysisInput, type AnalysisResult } from "@/lib/schema";
import type { AppSettings } from "@/lib/settings";
import { applyPerformanceAssessment } from "@/lib/performance-assessment";
import { applyEvidenceAssessment } from "@/lib/evidence-assessment";
import {
  buildTimedTranscript,
  preprocessComments
} from "@/lib/analysis-preprocess";

let client: OpenAI | null = null;

export async function analyzeWithOpenAI(
  input: AnalysisInput,
  settings: AppSettings
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  const response = await client.responses.parse({
    model: settings.openaiModel,
    reasoning: {
      effort: settings.openaiReasoningEffort
    },
    input: buildAnalysisMessages(
      {
        ...input,
        transcript: buildTimedTranscript(input.transcript),
        commentsRaw: preprocessComments(input.commentsRaw).join("\n")
      },
      settings
    ),
    text: {
      format: zodTextFormat(analysisResultSchema, "analysis_result")
    }
  });

  if (response.output_parsed) {
    return applyEvidenceAssessment(applyPerformanceAssessment(response.output_parsed, input), input);
  }

  throw new Error("The model did not return a structured analysis.");
}
