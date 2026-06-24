import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { buildTimedTranscript, preprocessComments } from "@/lib/analysis-preprocess";
import {
  applyPerformanceAssessment,
  assessPerformance,
  formatPerformanceContext
} from "@/lib/performance-assessment";
import {
  applyEvidenceAssessment,
  assessEvidence,
  formatEvidenceContext
} from "@/lib/evidence-assessment";
import { analysisResultSchema, type AnalysisInput, type AnalysisResult } from "@/lib/schema";
import type { AppSettings } from "@/lib/settings";

let client: GoogleGenAI | null = null;

export async function analyzeWithGemini(
  input: AnalysisInput,
  settings: AppSettings
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  const response = await client.models.generateContent({
    model: settings.geminiModel,
    contents: buildGeminiPrompt(
      {
        ...input,
        transcript: buildTimedTranscript(input.transcript),
        commentsRaw: preprocessComments(input.commentsRaw).join("\n")
      },
      settings
    ),
    config: {
      systemInstruction:
        "You are an expert content strategy analyst for product marketing teams. " +
        "Return only structured JSON. Be concrete, practical, and evidence-based.",
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(analysisResultSchema)
    }
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error("Gemini did not return any text output.");
  }

  return applyEvidenceAssessment(
    applyPerformanceAssessment(analysisResultSchema.parse(JSON.parse(rawText)), input),
    input
  );
}

function buildGeminiPrompt(input: AnalysisInput, settings: AppSettings) {
  const performanceAssessment = assessPerformance(input);
  const evidenceAssessment = assessEvidence(input);
  const metrics = [
    input.views ? `Views: ${input.views}` : null,
    input.likes ? `Likes: ${input.likes}` : null,
    input.commentsCount ? `Comments: ${input.commentsCount}` : null,
    input.shares ? `Shares: ${input.shares}` : null,
    input.saves ? `Saves: ${input.saves}` : null
  ]
    .filter(Boolean)
    .join(" | ");

  const comments = input.commentsRaw
    .split("\n")
    .map((comment) => comment.trim())
    .filter(Boolean)
    .slice(0, 150)
    .join("\n");

  return [
    "Analyze the following product video and its comments.",
    "Your goals:",
    "1. Assess whether the video is actually worth learning from based on the rule-based performance assessment.",
    "2. Identify the main user comment themes.",
    "3. Extract user language that is reusable for content, landing pages, pain-point framing, and search intent.",
    "4. Suggest what the next video should test.",
    "5. If a conclusion is uncertain, phrase it cautiously.",
    "5a. Do not assume this is a successful video. If performance_assessment.level is low or insufficient_data, avoid praise-heavy wording and frame takeaways as qualitative learnings rather than proven replication patterns.",
    "5b. Respect the evidence_assessment. If evidence mode is comment_language_analysis, do not over-emphasize video structure. If evidence mode is content_text_analysis, do not overstate comment-derived language assets.",
    `6. Write all explanatory sections in ${settings.locale === "zh" ? "Simplified Chinese" : "English"}.`,
    "7. Keep user_language_library.raw_quotes, user_language_library.benefit_phrases, user_language_library.raw_quote_groups.phrases, user_language_library.pain_point_expression_groups.phrases, user_language_library.seo_phrases, and user_language_library.seo_phrase_groups.phrases in the original language of the comments.",
    "8. Never include URLs, social links, creator promos, timestamps, or product links inside raw_quotes, benefit_phrases, grouped phrase fields, or seo_phrases.",
    "8a. The transcript may have been translated to English before analysis; comments are still the source of original user language.",
    "9. For seo_phrases, return only short search-like phrases that real users would search for. If the comments do not contain good evidence, return an empty array.",
    "10. For why_it_worked, organize the output into content_hook, trust_and_proof, audience_resonance, reusable_factors, and contextual_factors.",
    "11. For next_content_suggestions.content_directions, provide strategy directions and reasons, not direct title suggestions.",
    "12. For video_breakdown.sections, provide approximate start time, end time, and duration share based on the timed transcript.",
    "13. For raw_quote_groups, pain_point_expression_groups, and seo_phrase_groups, group phrases by concrete product selling point or user-perceived benefit area. Example group labels: Battery life, Sound quality, ANC/noise cancellation, Transparency mode, Comfort/fit, Ecosystem integration, Software reliability, Price/value.",
    "14. Treat benefit_phrases as pain-point expressions from user comments; do not fill it with generic positive value copy.",
    "15. For pain_point_phrases, summarize the pain points users mention rather than quoting raw comments.",
    "16. Do not use vague group labels like General, Misc, Other, Positive, or Negative unless there is truly no product-related aspect.",
    `17. Write each selling_point label in ${settings.locale === "zh" ? "Simplified Chinese" : "English"}, while keeping the phrases themselves in the original comment language.`,
    "18. For performance_assessment, reproduce the provided rule-based assessment exactly. Do not upgrade a low or insufficient_data video into a high-performing case.",
    "19. For evidence_assessment, reproduce the provided rule-based assessment exactly.",
    "",
    `Title: ${input.title}`,
    `Platform: ${input.platform}`,
    input.productName ? `Product: ${input.productName}` : null,
    input.creatorName ? `Creator: ${input.creatorName}` : null,
    input.videoUrl ? `Video URL: ${input.videoUrl}` : null,
    metrics ? `Metrics: ${metrics}` : null,
    input.language ? `Language: ${input.language}` : null,
    "",
    "Rule-based performance assessment:",
    formatPerformanceContext(performanceAssessment),
    "",
    "Rule-based text evidence assessment:",
    formatEvidenceContext(evidenceAssessment),
    "",
    "Transcript:",
    truncate(input.transcript, 14000),
    "",
    "Comments:",
    truncate(comments, 12000)
  ]
    .filter(Boolean)
    .join("\n");
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n[Truncated for analysis length control]`;
}
