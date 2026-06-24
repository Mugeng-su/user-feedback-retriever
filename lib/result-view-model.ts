import type { Locale } from "@/lib/i18n";

type AnyObject = Record<string, any>;

export function normalizeAnalysisResult(result: AnyObject, locale: Locale = "en") {
  return {
    evidenceAssessment: {
      available: Boolean(result.evidence_assessment),
      mode: result.evidence_assessment?.mode ?? "full_text_analysis",
      reasoning: result.evidence_assessment?.reasoning ?? "",
      transcriptCharCount: result.evidence_assessment?.transcript_char_count ?? null,
      commentCount: result.evidence_assessment?.comment_count ?? null,
      commentCharCount: result.evidence_assessment?.comment_char_count ?? null,
      evidenceWarnings: ensureArray(result.evidence_assessment?.evidence_warnings)
    },
    performanceAssessment: {
      level: result.performance_assessment?.level ?? "insufficient_data",
      reasoning:
        result.performance_assessment?.reasoning ??
        "Performance assessment is unavailable for this older analysis.",
      metricsUsed: ensureArray(result.performance_assessment?.metrics_used),
      dataWarnings: ensureArray(result.performance_assessment?.data_warnings),
      replicationConfidence:
        result.performance_assessment?.replication_confidence ?? "low",
      likeRate: result.performance_assessment?.like_rate ?? null,
      commentRate: result.performance_assessment?.comment_rate ?? null
    },
    summary: {
      oneLiner: result.summary?.one_liner ?? "",
      keyTakeaways: ensureArray(result.summary?.key_takeaways)
    },
    whyItWorked: {
      contentHook: ensureArray(
        result.why_it_worked?.content_hook ?? result.why_it_worked?.viral_factors
      ),
      trustAndProof: ensureArray(result.why_it_worked?.trust_and_proof),
      audienceResonance: ensureArray(result.why_it_worked?.audience_resonance),
      reusableFactors: ensureArray(result.why_it_worked?.reusable_factors),
      contextualFactors: ensureArray(
        result.why_it_worked?.contextual_factors ??
          result.why_it_worked?.non_reusable_factors
      )
    },
    videoBreakdown: {
      structureSummary:
        result.video_breakdown?.structure_summary ??
        joinSentences([
          result.video_breakdown?.problem_setup,
          result.video_breakdown?.solution_demo
        ]),
      pacingAssessment:
        result.video_breakdown?.pacing_assessment ??
        result.video_breakdown?.pacing_and_structure ??
        "",
      sections:
        ensureArray(result.video_breakdown?.sections).length > 0
          ? ensureArray(result.video_breakdown?.sections)
          : buildLegacySections(result.video_breakdown)
    },
    commentInsights: {
      topTopics: ensureArray(result.comment_insights?.top_topics),
      topPraises: ensureArray(result.comment_insights?.top_praises),
      topObjections: ensureArray(result.comment_insights?.top_objections),
      featureRequests: ensureArray(result.comment_insights?.feature_requests)
    },
    userLanguageLibrary: {
      rawQuotes: ensureArray(result.user_language_library?.raw_quotes),
      rawQuoteGroups: buildLanguageGroups(
        result.user_language_library?.raw_quote_groups,
        result.user_language_library?.raw_quotes,
        locale
      ),
      benefitPhrases: ensureArray(result.user_language_library?.benefit_phrases),
      painPointExpressionGroups: buildLanguageGroups(
        result.user_language_library?.pain_point_expression_groups,
        result.user_language_library?.benefit_phrases,
        locale
      ),
      painPointPhrases: ensureArray(result.user_language_library?.pain_point_phrases),
      seoPhrases: ensureArray(result.user_language_library?.seo_phrases),
      seoPhraseGroups: buildLanguageGroups(
        result.user_language_library?.seo_phrase_groups,
        result.user_language_library?.seo_phrases,
        locale
      )
    },
    nextContentSuggestions: {
      contentDirections:
        ensureArray(result.next_content_suggestions?.content_directions).length > 0
          ? ensureArray(result.next_content_suggestions?.content_directions)
          : buildLegacyDirections(result.next_content_suggestions),
      doMore: ensureArray(result.next_content_suggestions?.do_more),
      avoid: ensureArray(result.next_content_suggestions?.avoid)
    }
  };
}

export function normalizeDisplayText(text: string) {
  if (!text) {
    return "";
  }

  const emojiMap: Record<string, string> = {
    "😂": "[laughing emoji]",
    "😅": "[awkward laugh emoji]",
    "😢": "[crying emoji]",
    "😭": "[crying emoji]",
    "😃": "[smiling emoji]",
    "🔥": "[fire emoji]",
    "❤️": "[heart emoji]",
    "❤": "[heart emoji]",
    "👏": "[clapping emoji]",
    "👍": "[thumbs up emoji]",
    "👎": "[thumbs down emoji]"
  };

  let output = text;

  for (const [emoji, label] of Object.entries(emojiMap)) {
    output = output.split(emoji).join(` ${label} `);
  }

  output = output.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, "");
  output = output.replace(/\s+/g, " ").trim();

  return output;
}

function ensureArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function buildLanguageGroups(groups: any, fallbackPhrases: any, locale: Locale) {
  const normalizedGroups = ensureArray(groups)
    .map((group) => ({
      sellingPoint: group?.selling_point ?? group?.sellingPoint ?? "",
      phrases: ensureArray(group?.phrases)
    }))
    .filter((group) => group.sellingPoint && group.phrases.length > 0);

  if (normalizedGroups.length > 0) {
    return normalizedGroups;
  }

  const phrases = ensureArray(fallbackPhrases);

  return buildFallbackLanguageGroups(phrases, locale);
}

function buildFallbackLanguageGroups(phrases: string[], locale: Locale) {
  const buckets = getFallbackBuckets(locale);
  const grouped = buckets
    .map((bucket) => ({
      sellingPoint: bucket.label,
      phrases: phrases.filter((phrase) => bucket.pattern.test(phrase))
    }))
    .filter((group) => group.phrases.length > 0);

  const groupedPhrases = new Set(grouped.flatMap((group) => group.phrases));
  const remaining = phrases.filter((phrase) => !groupedPhrases.has(phrase));

  if (remaining.length > 0) {
    grouped.push({
      sellingPoint: locale === "zh" ? "其他用户表达" : "Other user language",
      phrases: remaining
    });
  }

  return grouped;
}

function getFallbackBuckets(locale: Locale) {
  const labels =
    locale === "zh"
      ? {
          battery: "续航",
          sound: "音质",
          noise: "降噪与透传",
          comfort: "佩戴舒适度",
          ecosystem: "苹果生态与连接",
          reliability: "软件稳定性",
          price: "价格与购买决策"
        }
      : {
          battery: "Battery life",
          sound: "Sound quality",
          noise: "Noise cancellation and transparency",
          comfort: "Comfort and fit",
          ecosystem: "Apple ecosystem and connection",
          reliability: "Software reliability",
          price: "Price and purchase decision"
        };

  return [
    {
      label: labels.battery,
      pattern: /battery|charge|charging|hours|续航|电池|充电/i
    },
    {
      label: labels.sound,
      pattern: /sound|audio|bass|music|quality|音质|声音|低音|音乐/i
    },
    {
      label: labels.noise,
      pattern: /anc|noise|cancel|cancellation|transparency|ambient|降噪|透传|通透|噪音/i
    },
    {
      label: labels.comfort,
      pattern: /comfort|comfortable|fit|ear|ears|tips|wear|舒适|佩戴|耳朵|耳塞/i
    },
    {
      label: labels.ecosystem,
      pattern: /apple|iphone|mac|ecosystem|switch|connect|pair|苹果|生态|连接|切换/i
    },
    {
      label: labels.reliability,
      pattern: /bug|issue|glitch|software|firmware|problem|海浪|空洞|漏洞|软件|固件|问题/i
    },
    {
      label: labels.price,
      pattern: /price|worth|buy|expensive|cost|deal|价格|值得|购买|贵|性价比/i
    }
  ];
}

function buildLegacySections(videoBreakdown: AnyObject) {
  if (!videoBreakdown) {
    return [];
  }

  return [
    {
      label: "Hook",
      start_time: "00:00",
      end_time: "00:20",
      duration_ratio: "~7%",
      summary: videoBreakdown.hook ?? ""
    },
    {
      label: "Problem setup",
      start_time: "00:20",
      end_time: "01:30",
      duration_ratio: "~23%",
      summary: videoBreakdown.problem_setup ?? ""
    },
    {
      label: "Solution demo",
      start_time: "01:30",
      end_time: "03:00",
      duration_ratio: "~30%",
      summary: videoBreakdown.solution_demo ?? ""
    },
    {
      label: "Proof",
      start_time: "03:00",
      end_time: "04:10",
      duration_ratio: "~23%",
      summary: joinSentences(ensureArray(videoBreakdown.proof_points))
    },
    {
      label: "Ending / CTA",
      start_time: "04:10",
      end_time: "05:00",
      duration_ratio: "~17%",
      summary: videoBreakdown.ending_and_cta ?? ""
    }
  ].filter((section) => section.summary);
}

function buildLegacyDirections(nextContentSuggestions: AnyObject) {
  const angles = ensureArray(nextContentSuggestions?.next_angles);
  const hooks = ensureArray(nextContentSuggestions?.opening_hooks);
  const copy = ensureArray(nextContentSuggestions?.copywriting_phrases);

  return angles.map((direction: string, index: number) => ({
    direction,
    why_this_direction: hooks[index] ?? copy[index] ?? "",
    supporting_signals: []
  }));
}

function joinSentences(items: string[]) {
  return items.filter(Boolean).join(" ");
}
