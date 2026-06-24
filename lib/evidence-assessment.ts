import type { AnalysisInput, AnalysisResult } from "@/lib/schema";

export type EvidenceMode =
  | "full_text_analysis"
  | "comment_language_analysis"
  | "content_text_analysis"
  | "insufficient_evidence";

export type EvidenceAssessment = {
  mode: EvidenceMode;
  reasoning: string;
  transcript_char_count: number;
  comment_count: number;
  comment_char_count: number;
  evidence_warnings: string[];
};

const MIN_TRANSCRIPT_CHARS = 600;
const MIN_COMMENT_COUNT = 20;
const MIN_COMMENT_CHARS = 800;

export function assessEvidence(input: AnalysisInput): EvidenceAssessment {
  const transcriptCharCount = input.transcript.trim().length;
  const comments = splitComments(input.commentsRaw);
  const commentCharCount = comments.join("\n").length;
  const hasTranscriptEvidence = transcriptCharCount >= MIN_TRANSCRIPT_CHARS;
  const hasCommentEvidence =
    comments.length >= MIN_COMMENT_COUNT && commentCharCount >= MIN_COMMENT_CHARS;
  const warnings = buildEvidenceWarnings(
    transcriptCharCount,
    comments.length,
    commentCharCount
  );

  if (hasTranscriptEvidence && hasCommentEvidence) {
    return {
      mode: "full_text_analysis",
      reasoning:
        "The transcript and comments both provide enough text evidence for a full text-based content analysis.",
      transcript_char_count: transcriptCharCount,
      comment_count: comments.length,
      comment_char_count: commentCharCount,
      evidence_warnings: warnings
    };
  }

  if (!hasTranscriptEvidence && hasCommentEvidence) {
    return {
      mode: "comment_language_analysis",
      reasoning:
        "The transcript is short, but the comments provide enough text evidence for comment themes and reusable user language.",
      transcript_char_count: transcriptCharCount,
      comment_count: comments.length,
      comment_char_count: commentCharCount,
      evidence_warnings: warnings
    };
  }

  if (hasTranscriptEvidence && !hasCommentEvidence) {
    return {
      mode: "content_text_analysis",
      reasoning:
        "The transcript provides enough text evidence for content structure analysis, but the comments are too limited for strong user-language conclusions.",
      transcript_char_count: transcriptCharCount,
      comment_count: comments.length,
      comment_char_count: commentCharCount,
      evidence_warnings: warnings
    };
  }

  return {
    mode: "insufficient_evidence",
    reasoning:
      "Both transcript and comment evidence are limited, so a detailed analysis would risk over-interpreting sparse text.",
    transcript_char_count: transcriptCharCount,
    comment_count: comments.length,
    comment_char_count: commentCharCount,
    evidence_warnings: warnings
  };
}

export function shouldSkipForEvidence(assessment: EvidenceAssessment) {
  return assessment.mode === "insufficient_evidence";
}

export function formatEvidenceContext(assessment: EvidenceAssessment) {
  return [
    `Evidence mode: ${assessment.mode}`,
    `Reasoning: ${assessment.reasoning}`,
    `Transcript characters: ${assessment.transcript_char_count}`,
    `Comment count: ${assessment.comment_count}`,
    `Comment characters: ${assessment.comment_char_count}`,
    `Evidence warnings: ${assessment.evidence_warnings.join(" | ") || "none"}`
  ].join("\n");
}

export function applyEvidenceAssessment(
  result: AnalysisResult,
  input: AnalysisInput
): AnalysisResult {
  return {
    ...result,
    evidence_assessment: assessEvidence(input)
  };
}

function splitComments(commentsRaw: string) {
  return commentsRaw
    .split("\n")
    .map((comment) => comment.trim())
    .filter(Boolean);
}

function buildEvidenceWarnings(
  transcriptCharCount: number,
  commentCount: number,
  commentCharCount: number
) {
  const warnings: string[] = [];

  if (transcriptCharCount < MIN_TRANSCRIPT_CHARS) {
    warnings.push("Transcript text is short.");
  }

  if (commentCount < MIN_COMMENT_COUNT) {
    warnings.push("Comment sample count is low.");
  }

  if (commentCharCount < MIN_COMMENT_CHARS) {
    warnings.push("Comment text volume is low.");
  }

  return warnings;
}
