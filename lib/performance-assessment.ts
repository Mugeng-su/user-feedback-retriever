import type { AnalysisInput, AnalysisResult } from "@/lib/schema";
import type { Locale } from "@/lib/i18n";
import type { EvidenceAssessment } from "@/lib/evidence-assessment";

export type PerformanceLevel = "high" | "medium" | "low" | "insufficient_data";
export type ReplicationConfidence = "high" | "medium" | "low";

export type PerformanceAssessment = {
  level: PerformanceLevel;
  reasoning: string;
  metrics_used: string[];
  data_warnings: string[];
  replication_confidence: ReplicationConfidence;
  like_rate: number | null;
  comment_rate: number | null;
};

export function assessPerformance(input: AnalysisInput): PerformanceAssessment {
  const metricsUsed = [
    input.views ? "views" : null,
    input.likes ? "likes" : null,
    input.commentsCount ? "comments" : null
  ].filter(Boolean) as string[];
  const warnings = buildWarnings(input);
  const likeRate = input.views && input.likes ? input.likes / input.views : null;
  const commentRate =
    input.views && input.commentsCount ? input.commentsCount / input.views : null;

  if (!input.views) {
    return {
      level: "insufficient_data",
      reasoning:
        "Views are missing, so the system cannot reliably judge whether this video performed well. Treat content takeaways as qualitative only.",
      metrics_used: metricsUsed,
      data_warnings: ["Views are missing.", ...warnings],
      replication_confidence: "low",
      like_rate: likeRate,
      comment_rate: commentRate
    };
  }

  if (warnings.length > 0) {
    return {
      level: "insufficient_data",
      reasoning:
        "The provided metrics contain possible inconsistencies, so performance judgment should be treated as low confidence.",
      metrics_used: metricsUsed,
      data_warnings: warnings,
      replication_confidence: "low",
      like_rate: likeRate,
      comment_rate: commentRate
    };
  }

  if (input.views < 5000 || (input.commentsCount ?? 0) < 25) {
    return {
      level: "low",
      reasoning:
        "The provided views or comment volume are low, so this should not be treated as a proven high-performing video. Use it only for qualitative learnings.",
      metrics_used: metricsUsed,
      data_warnings: warnings,
      replication_confidence: "low",
      like_rate: likeRate,
      comment_rate: commentRate
    };
  }

  if (input.views >= 50000 || (input.commentsCount ?? 0) >= 150) {
    return {
      level: "high",
      reasoning:
        "The provided views or comment volume suggest this is a strong candidate for replication analysis, assuming the metrics are accurate.",
      metrics_used: metricsUsed,
      data_warnings: warnings,
      replication_confidence: "high",
      like_rate: likeRate,
      comment_rate: commentRate
    };
  }

  return {
    level: "medium",
    reasoning:
      "The provided metrics suggest there may be useful learnings, but the video should be treated as a partial signal rather than a proven breakout.",
    metrics_used: metricsUsed,
    data_warnings: warnings,
    replication_confidence: "medium",
    like_rate: likeRate,
    comment_rate: commentRate
  };
}

export function formatPerformanceContext(assessment: PerformanceAssessment) {
  return [
    `Performance level: ${assessment.level}`,
    `Replication confidence: ${assessment.replication_confidence}`,
    `Reasoning: ${assessment.reasoning}`,
    `Metrics used: ${assessment.metrics_used.join(", ") || "none"}`,
    `Like rate: ${formatRate(assessment.like_rate)}`,
    `Comment rate: ${formatRate(assessment.comment_rate)}`,
    `Data warnings: ${assessment.data_warnings.join(" | ") || "none"}`
  ].join("\n");
}

export function applyPerformanceAssessment(
  result: AnalysisResult,
  input: AnalysisInput
): AnalysisResult {
  return {
    ...result,
    performance_assessment: assessPerformance(input)
  };
}

export function shouldSkipDetailedAnalysis(assessment: PerformanceAssessment) {
  return assessment.level === "low" || assessment.level === "insufficient_data";
}

export function buildScreenedAnalysisResult(
  input: AnalysisInput,
  assessment: PerformanceAssessment,
  locale: Locale,
  evidenceAssessment?: EvidenceAssessment
): AnalysisResult {
  const isChinese = locale === "zh";
  const isEvidenceBlocked = evidenceAssessment?.mode === "insufficient_evidence";
  const title =
    isEvidenceBlocked
      ? isChinese
        ? "这条素材文本证据不足，不建议分析。"
        : "This video does not have enough text evidence for analysis."
      : assessment.level === "insufficient_data"
      ? isChinese
        ? "这条素材暂时无法判断是否值得复用。"
        : "This video cannot be judged reliably yet."
      : isChinese
        ? "这条素材不建议进入复用分析。"
        : "This video is not recommended for replication analysis.";
  const body =
    isEvidenceBlocked
      ? isChinese
        ? "这条素材的字幕和评论文本都偏少，继续生成完整报告容易让 AI 过度推断。建议补充更完整的字幕或抓取更多评论后再分析。"
        : "Both transcript and comment text are limited, so a full report would likely over-interpret sparse evidence. Add fuller subtitles or more comments before analyzing it."
      : assessment.level === "insufficient_data"
      ? isChinese
        ? "关键表现数据缺失或存在异常，继续做内容拆解容易产生误导性结论。建议先补齐或校验播放、点赞和评论数据，再决定是否分析。"
        : "Key performance data is missing or inconsistent, so a full breakdown could create misleading conclusions. Verify views, likes, and comments before analyzing it."
      : isChinese
        ? "基于当前播放、点赞和评论数据，这条视频还没有表现出足够强的复刻价值。建议把它作为普通素材归档，不消耗时间做完整复盘。"
        : "Based on the entered views, likes, and comments, this video does not show enough replication value. Archive it as a reference instead of spending time on a full teardown.";

  return {
    evidence_assessment: evidenceAssessment,
    performance_assessment: assessment,
    summary: {
      one_liner: title,
      key_takeaways: [body]
    },
    why_it_worked: {
      content_hook: [],
      trust_and_proof: [],
      audience_resonance: [],
      reusable_factors: [],
      contextual_factors: []
    },
    video_breakdown: {
      structure_summary: "",
      pacing_assessment: "",
      sections: []
    },
    comment_insights: {
      top_topics: [],
      top_praises: [],
      top_objections: [],
      feature_requests: []
    },
    user_language_library: {
      raw_quotes: [],
      raw_quote_groups: [],
      benefit_phrases: [],
      pain_point_expression_groups: [],
      pain_point_phrases: [],
      seo_phrases: [],
      seo_phrase_groups: []
    },
    next_content_suggestions: {
      content_directions: [],
      do_more: [],
      avoid: []
    }
  };
}

function buildWarnings(input: AnalysisInput) {
  const warnings: string[] = [];

  if (input.views && input.likes && input.likes > input.views) {
    warnings.push("Likes are greater than views.");
  }

  if (input.views && input.commentsCount && input.commentsCount > input.views) {
    warnings.push("Comments are greater than views.");
  }

  if (!input.likes) {
    warnings.push("Likes are missing.");
  }

  if (!input.commentsCount) {
    warnings.push("Comments are missing.");
  }

  return warnings;
}

function formatRate(value: number | null) {
  return value === null ? "unknown" : `${(value * 100).toFixed(2)}%`;
}
