import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const optionalNumber = z.number().nonnegative().optional();

const languageAssetGroupSchema = z.object({
  selling_point: z.string(),
  phrases: z.array(z.string())
});

export const analysisResultSchema = z.object({
  evidence_assessment: z
    .object({
      mode: z.enum([
        "full_text_analysis",
        "comment_language_analysis",
        "content_text_analysis",
        "insufficient_evidence"
      ]),
      reasoning: z.string(),
      transcript_char_count: z.number(),
      comment_count: z.number(),
      comment_char_count: z.number(),
      evidence_warnings: z.array(z.string())
    })
    .optional(),
  performance_assessment: z.object({
    level: z.enum(["high", "medium", "low", "insufficient_data"]),
    reasoning: z.string(),
    metrics_used: z.array(z.string()),
    data_warnings: z.array(z.string()),
    replication_confidence: z.enum(["high", "medium", "low"]),
    like_rate: z.number().nullable(),
    comment_rate: z.number().nullable()
  }),
  summary: z.object({
    one_liner: z.string(),
    key_takeaways: z.array(z.string())
  }),
  why_it_worked: z.object({
    content_hook: z.array(z.string()),
    trust_and_proof: z.array(z.string()),
    audience_resonance: z.array(z.string()),
    reusable_factors: z.array(z.string()),
    contextual_factors: z.array(z.string())
  }),
  video_breakdown: z.object({
    structure_summary: z.string(),
    pacing_assessment: z.string(),
    sections: z.array(
      z.object({
        label: z.string(),
        start_time: z.string(),
        end_time: z.string(),
        duration_ratio: z.string(),
        summary: z.string()
      })
    )
  }),
  comment_insights: z.object({
    top_topics: z.array(
      z.object({
        topic: z.string(),
        sentiment: z.enum(["positive", "mixed", "negative", "neutral"]),
        description: z.string(),
        example_comments: z.array(z.string())
      })
    ),
    top_praises: z.array(z.string()),
    top_objections: z.array(z.string()),
    feature_requests: z.array(z.string())
  }),
  user_language_library: z.object({
    raw_quotes: z.array(z.string()),
    raw_quote_groups: z.array(languageAssetGroupSchema),
    benefit_phrases: z.array(z.string()),
    pain_point_expression_groups: z.array(languageAssetGroupSchema),
    pain_point_phrases: z.array(z.string()),
    seo_phrases: z.array(z.string()),
    seo_phrase_groups: z.array(languageAssetGroupSchema)
  }),
  next_content_suggestions: z.object({
    content_directions: z.array(
      z.object({
        direction: z.string(),
        why_this_direction: z.string(),
        supporting_signals: z.array(z.string())
      })
    ),
    do_more: z.array(z.string()),
    avoid: z.array(z.string())
  })
});

export const analysisInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3),
  platform: z.string().trim().min(2),
  videoUrl: optionalTrimmedString,
  productName: optionalTrimmedString,
  creatorName: optionalTrimmedString,
  views: optionalNumber,
  likes: optionalNumber,
  commentsCount: optionalNumber,
  shares: optionalNumber,
  saves: optionalNumber,
  transcript: z.string().trim().min(40),
  commentsRaw: z.string().trim().min(20),
  language: optionalTrimmedString,
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  providerUsed: optionalTrimmedString,
  errorMessage: optionalTrimmedString,
  resultJson: analysisResultSchema.optional()
});

export const settingsInputSchema = z.object({
  preferredProvider: z.enum(["auto", "openai", "gemini", "mock"]).optional(),
  openaiModel: z.string().trim().min(1).optional(),
  geminiModel: z.string().trim().min(1).optional(),
  openaiReasoningEffort: z.enum(["low", "medium", "high"]).optional(),
  locale: z.enum(["en", "zh"]).optional()
});

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type SettingsInput = z.infer<typeof settingsInputSchema>;
