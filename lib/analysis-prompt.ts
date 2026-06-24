import type { AnalysisInput } from "@/lib/schema";
import type { AppSettings } from "@/lib/settings";
import { assessPerformance, formatPerformanceContext } from "@/lib/performance-assessment";
import { assessEvidence, formatEvidenceContext } from "@/lib/evidence-assessment";

export function buildAnalysisMessages(input: AnalysisInput, settings: AppSettings) {
  const normalizedComments = normalizeComments(input.commentsRaw);
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

  return [
    {
      role: "system" as const,
      content: [
        {
          type: "input_text" as const,
          text:
            "You are an expert content strategy analyst for product marketing teams. " +
            "Your task is to analyze one product video and its comments. " +
            "Do not assume the video is high-performing. First respect the provided performance_assessment. " +
            "Be concrete, specific, and practical. Focus on whether the video is actually worth learning from, what made the video work or not work, " +
            "what users actually care about, how users describe pain points in their own words, " +
            "and what the team should do in the next video. Avoid generic advice. " +
            `Write all explanatory fields in ${settings.locale === "zh" ? "Simplified Chinese" : "English"}. ` +
            "Keep user_language_library.raw_quotes, user_language_library.benefit_phrases, user_language_library.raw_quote_groups.phrases, user_language_library.pain_point_expression_groups.phrases, user_language_library.seo_phrases, and user_language_library.seo_phrase_groups.phrases in the original comment language. " +
            "Do not include URLs, creator promos, social links, or product links in those language-library fields. " +
            "The transcript may have been translated to English before analysis; comments should still be treated as the source of original user language. " +
            "For seo_phrases, only return short search-like phrases grounded in the comments. Return an empty array if evidence is weak. " +
            "For raw_quote_groups, pain_point_expression_groups, and seo_phrase_groups, group phrases by specific product selling points or user-perceived benefit areas, such as battery life, sound quality, ANC/noise cancellation, transparency mode, comfort/fit, ecosystem integration, software reliability, price/value, or other product-specific aspects. Do not use vague bucket names like General, Misc, Other, Positive, or Negative unless there is truly no product-related aspect. " +
            `Write each selling_point label in ${settings.locale === "zh" ? "Simplified Chinese" : "English"}, while keeping the phrases themselves in the original comment language. ` +
            "Treat benefit_phrases as pain-point expressions from comments; do not fill it with generic positive value copy. " +
            "For pain_point_phrases, summarize the pain points users mention rather than quoting raw comments. " +
            "For performance_assessment, reproduce the provided rule-based assessment exactly. Do not upgrade a low or insufficient_data video into a high-performing case. " +
            "For evidence_assessment, reproduce the provided rule-based assessment exactly. " +
            "If performance_assessment.level is low or insufficient_data, avoid praise-heavy wording and frame takeaways as qualitative learnings rather than proven replication patterns. " +
            "If evidence_assessment.mode is comment_language_analysis, focus on comment themes and user language, and keep video structure claims cautious. " +
            "If evidence_assessment.mode is content_text_analysis, focus on transcript/content text and keep comment-language claims cautious. " +
            "For why_it_worked, organize points into the exact categories defined by the schema. " +
            "For next_content_suggestions, provide strategic directions plus reasoning, not title ideas. " +
            "For video_breakdown.sections, use the timed transcript evidence to provide approximate start/end timestamps and duration share."
        }
      ]
    },
    {
      role: "user" as const,
      content: [
        {
          type: "input_text" as const,
          text: [
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
            "Timed transcript:",
            limitText(input.transcript, 14000),
            "",
            "Comments:",
            limitText(normalizedComments, 12000),
            "",
            "Important instructions:",
            "1. Infer what makes the content work from the transcript and available metrics.",
            "1a. Do not assume this is a successful video. Follow the rule-based performance assessment when deciding whether the video is suitable for replication.",
            "1b. Follow the rule-based text evidence assessment when deciding what kind of analysis is safe to provide.",
            "2. Use the comments to identify purchase intent, objections, praise, scenarios, and feature requests.",
            "3. Keep extracted phrases close to how users actually speak.",
            "4. Make the next-content suggestions specific enough for a content team to use immediately.",
            "5. If evidence is weak for a claim, phrase it as a cautious inference rather than a certainty.",
            "6. The transcript may have been cleaned from subtitle timestamps. Treat it as spoken content, not subtitle metadata.",
            "6a. The transcript may have been translated to English before analysis. Do not translate comment-derived language-library phrases unless the comments themselves are English.",
            "7. raw_quotes, benefit_phrases, and seo_phrases must be short, real user expressions from comments, not invented marketing copy.",
            "8. In why_it_worked, separate the analysis into content_hook, trust_and_proof, audience_resonance, reusable_factors, and contextual_factors.",
            "9. In next_content_suggestions.content_directions, each item must explain the direction, why it is worth testing, and what in the comments/transcript supports it.",
            "10. In video_breakdown.sections, include approximate timestamps and duration share using the transcript timing.",
            "11. In user_language_library.raw_quote_groups, pain_point_expression_groups, and seo_phrase_groups, group phrases by concrete product selling point or user-perceived benefit area. Example group labels: Battery life, Sound quality, ANC/noise cancellation, Transparency mode, Comfort/fit, Ecosystem integration, Software reliability, Price/value. Do not use General as a group label.",
            "12. Treat benefit_phrases as pain-point expressions from user comments, because the UI labels this section as Pain-point Expressions.",
            "13. In user_language_library.pain_point_phrases, summarize pain points users mention. Do not make this field a list of raw comment quotes.",
            "14. If evidence_assessment.mode is comment_language_analysis, do not pretend the transcript is sufficient for detailed pacing or structure claims.",
            "15. If evidence_assessment.mode is content_text_analysis, return fewer or empty comment-derived language assets when comment evidence is weak."
          ]
            .filter(Boolean)
            .join("\n")
        }
      ]
    }
  ];
}

function normalizeComments(commentsRaw: string) {
  return commentsRaw
    .split("\n")
    .map((comment) => comment.trim())
    .filter(Boolean)
    .slice(0, 150)
    .join("\n");
}

function limitText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n[Truncated for analysis length control]`;
}
