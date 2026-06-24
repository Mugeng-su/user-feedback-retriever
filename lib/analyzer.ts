import { analyzeSubmission } from "@/lib/mock-analyzer";
import { analyzeWithGemini } from "@/lib/gemini-analyzer";
import { analyzeWithOpenAI } from "@/lib/openai-analyzer";
import type { AnalysisExecution } from "@/lib/analysis-types";
import type { AnalysisInput } from "@/lib/schema";
import { getSettings } from "@/lib/settings";
import { ensureEnglishTranscript } from "@/lib/transcript-translator";
import { assessEvidence, shouldSkipForEvidence } from "@/lib/evidence-assessment";
import {
  assessPerformance,
  buildScreenedAnalysisResult,
  shouldSkipDetailedAnalysis
} from "@/lib/performance-assessment";

export async function runAnalysis(input: AnalysisInput): Promise<AnalysisExecution> {
  const settings = await getSettings();
  const performanceAssessment = assessPerformance(input);
  const evidenceAssessment = assessEvidence(input);

  if (shouldSkipDetailedAnalysis(performanceAssessment)) {
    return {
      provider: "screening",
      result: buildScreenedAnalysisResult(
        input,
        performanceAssessment,
        settings.locale,
        evidenceAssessment
      )
    };
  }

  if (shouldSkipForEvidence(evidenceAssessment)) {
    return {
      provider: "screening",
      result: buildScreenedAnalysisResult(
        input,
        performanceAssessment,
        settings.locale,
        evidenceAssessment
      )
    };
  }

  const mode = process.env.ANALYZER_MODE ?? settings.preferredProvider;
  const preparedInput =
    mode === "mock" ? input : await ensureEnglishTranscript(input, settings);

  if (mode === "mock") {
    return {
      provider: "mock",
      result: analyzeSubmission(input)
    };
  }

  if (mode === "openai") {
    return {
      provider: "openai",
      result: await analyzeWithOpenAI(preparedInput, settings)
    };
  }

  if (mode === "gemini") {
    return {
      provider: "gemini",
      result: await analyzeWithGemini(preparedInput, settings)
    };
  }

  const failures: string[] = [];

  if (process.env.OPENAI_API_KEY) {
    try {
      return {
        provider: "openai",
        result: await analyzeWithOpenAI(preparedInput, settings)
      };
    } catch (error) {
      failures.push(`openai: ${formatProviderError(error)}`);
      console.error("OpenAI analyzer failed.", error);
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      return {
        provider: "gemini",
        result: await analyzeWithGemini(preparedInput, settings)
      };
    } catch (error) {
      failures.push(`gemini: ${formatProviderError(error)}`);
      console.error("Gemini analyzer failed.", error);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `All configured real analyzers failed. ${failures.join(" | ")}`
    );
  }

  return {
    provider: "mock",
    result: analyzeSubmission(input)
  };
}

function formatProviderError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
