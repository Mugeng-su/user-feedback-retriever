import type { AnalysisInput, AnalysisResult } from "@/lib/schema";
import { assessPerformance } from "@/lib/performance-assessment";
import { assessEvidence } from "@/lib/evidence-assessment";

export function analyzeSubmission(input: AnalysisInput): AnalysisResult {
  const performanceAssessment = assessPerformance(input);
  const evidenceAssessment = assessEvidence(input);
  const comments = splitComments(input.commentsRaw);
  const lowerComments = comments.map((comment) => comment.toLowerCase());
  const transcript = input.transcript.trim();
  const transcriptStart = transcript.slice(0, 220);

  const praiseKeywords = ["love", "need", "good", "great", "wow", "amazing", "want"];
  const objectionKeywords = ["price", "expensive", "ship", "shipping", "fake", "scam", "ads"];
  const requestKeywords = ["wish", "could", "does it", "can it", "need it to"];

  const praises = matchComments(lowerComments, praiseKeywords, comments);
  const objections = matchComments(lowerComments, objectionKeywords, comments);
  const requests = matchComments(lowerComments, requestKeywords, comments);
  const quotePool = comments.slice(0, 5);

  const strongIntentCount = comments.filter((comment) =>
    /(need|want|where|link|buy|ordered|ordering|price)/i.test(comment)
  ).length;

  return {
    evidence_assessment: evidenceAssessment,
    performance_assessment: performanceAssessment,
    summary: {
      one_liner:
        strongIntentCount > 1
          ? "The video turns curiosity into purchase intent by pairing a fast proof-led demo with language users immediately repeat in the comments."
          : "The video earns attention by making the product benefit legible fast and leaving viewers with an easy phrase to repeat.",
      key_takeaways: [
        "The opening establishes value quickly instead of making viewers wait for context.",
        "Comments echo the benefit in plain language, which is a strong signal for reusable messaging.",
        "The winning pattern is less about novelty alone and more about clear proof plus low-friction understanding."
      ]
    },
    why_it_worked: {
      content_hook: [
        "The first seconds give viewers a concrete payoff instead of a generic intro.",
        "The topic is framed around a visible problem that users can recognize immediately."
      ],
      trust_and_proof: [
        "The product benefit appears tied to an everyday use case, which lowers the effort required to imagine ownership.",
        "Comment behavior suggests the content creates both curiosity and intent, not just passive engagement."
      ],
      audience_resonance: [
        "Viewers can easily map the product into their own routines, which increases comment depth and purchase-intent language."
      ],
      reusable_factors: [
        "Lead with the before-and-after or strongest proof point.",
        "Use language that mirrors how users describe the value, not internal brand phrasing.",
        "Keep the structure tight so the key benefit lands before attention drops."
      ],
      contextual_factors: [
        "Creator-specific trust or audience loyalty may be amplifying performance.",
        "Any spike from timing, platform distribution, or trend alignment should not be copied blindly."
      ]
    },
    video_breakdown: {
      structure_summary:
        "The structure moves from a quick hook into a familiar problem, then uses a product demo and closing reinforcement to hold attention.",
      pacing_assessment:
        "The pacing favors short explanatory beats and proof moments, which keeps the video skimmable without losing the main narrative.",
      sections: [
        {
          label: "Hook",
          start_time: "00:00",
          end_time: "00:20",
          duration_ratio: "~7%",
          summary: `The opening establishes immediate product context: "${transcriptStart}${transcript.length > 220 ? "..." : ""}"`
        },
        {
          label: "Problem setup",
          start_time: "00:20",
          end_time: "01:20",
          duration_ratio: "~20%",
          summary:
            "The video frames a familiar friction point quickly, which helps viewers identify themselves in the scenario."
        },
        {
          label: "Solution demo",
          start_time: "01:20",
          end_time: "02:40",
          duration_ratio: "~27%",
          summary:
            "The product is shown as the resolution path rather than only being described abstractly."
        },
        {
          label: "Proof",
          start_time: "02:40",
          end_time: "04:10",
          duration_ratio: "~30%",
          summary:
            "Visual proof appears early enough to support the claim, and the script focuses on outcome over a feature list."
        },
        {
          label: "Ending / CTA",
          start_time: "04:10",
          end_time: "05:00",
          duration_ratio: "~16%",
          summary:
            "The ending reinforces the remembered benefit phrase and points viewers toward a next action."
        }
      ],
    },
    comment_insights: {
      top_topics: [
        {
          topic: "Purchase intent",
          sentiment: "positive",
          description:
            "A meaningful share of comments signal wanting the product, asking where to buy it, or expressing immediate demand.",
          example_comments: limitItems(
            comments.filter((comment) => /(need|want|where|buy|link|ordered)/i.test(comment)),
            3
          )
        },
        {
          topic: "Product credibility",
          sentiment: objections.length > 0 ? "mixed" : "neutral",
          description:
            "Some viewers are validating whether the product really works, whether the result is authentic, or whether the value justifies the price.",
          example_comments: limitItems(objections, 3)
        },
        {
          topic: "Usage fit",
          sentiment: "mixed",
          description:
            "Viewers are testing whether the product fits their own scenario, which is useful for future targeting and content angles.",
          example_comments: limitItems(
            comments.filter((comment) => /(for me|my|work|kitchen|desk|travel|small)/i.test(comment)),
            3
          )
        }
      ],
      top_praises: limitItems(
        praises.length > 0 ? praises : quotePool,
        5
      ),
      top_objections: limitItems(
        objections.length > 0
          ? objections
          : ["Price clarity and proof depth should be tested more explicitly in future content."],
        5
      ),
      feature_requests: limitItems(
        requests.length > 0 ? requests : ["Collect more comments that ask about edge cases, sizing, or compatibility."],
        5
      )
    },
    user_language_library: {
      raw_quotes: limitItems(quotePool, 5),
      raw_quote_groups: [
        {
          selling_point: "General product appeal",
          phrases: limitItems(quotePool, 5)
        }
      ],
      benefit_phrases: buildPhraseSet(comments, /(so|too|super|really|perfect|easy|clean|helpful)/i, [
        "easy to use",
        "actually useful",
        "solves a real problem"
      ]),
      pain_point_expression_groups: [
        {
          selling_point: "Pain-point language",
          phrases: buildPhraseSet(comments, /(price|wish|need|too|problem|hard|small|big)/i, [
            "is it worth the price",
            "need to know if it works long term",
            "want to see it in more real-life situations"
          ])
        }
      ],
      pain_point_phrases: buildPhraseSet(comments, /(price|wish|need|too|problem|hard|small|big)/i, [
        "is it worth the price",
        "need to know if it works long term",
        "want to see it in more real-life situations"
      ]),
      seo_phrases: buildPhraseSet(comments, /(where|buy|worth|review|does it|how to)/i, [
        "product review",
        "is it worth it",
        "where to buy"
      ]),
      seo_phrase_groups: [
        {
          selling_point: "Search intent",
          phrases: buildPhraseSet(comments, /(where|buy|worth|review|does it|how to)/i, [
            "product review",
            "is it worth it",
            "where to buy"
          ])
        }
      ]
    },
    next_content_suggestions: {
      content_directions: [
        {
          direction:
            "Build the next video around a narrower audience scenario and make the use case more specific.",
          why_this_direction:
            "A tighter scenario helps viewers recognize themselves faster and usually sharpens both retention and comment relevance.",
          supporting_signals: [
            "Several comments map the product into a personal routine or daily workflow."
          ]
        },
        {
          direction:
            "Test a follow-up that answers the strongest skepticism point in the first third of the video.",
          why_this_direction:
            "When objections show up early in comments, addressing them directly can turn curiosity into trust.",
          supporting_signals: [
            "Comments include proof-seeking, doubt, or value-for-money questions."
          ]
        },
        {
          direction:
            "Create a follow-up centered on the strongest user-language pattern from comments.",
          why_this_direction:
            "Reusing natural user language often increases resonance more than brand-written phrasing.",
          supporting_signals: [
            "Multiple comments repeat plain-language descriptions of the main value."
          ]
        }
      ],
      do_more: [
        "Show proof faster.",
        "Keep the value proposition concrete and physical.",
        "Use user wording as headline inspiration."
      ],
      avoid: [
        "Avoid generic lifestyle framing before the core payoff is clear.",
        "Avoid over-claiming if the comments show even mild skepticism.",
        "Avoid relying only on creator charisma to carry the message."
      ]
    }
  };
}

function splitComments(commentsRaw: string) {
  return commentsRaw
    .split("\n")
    .map((comment) => comment.trim())
    .filter(Boolean);
}

function matchComments(lowerComments: string[], keywords: string[], originalComments: string[]) {
  return originalComments.filter((_comment, index) =>
    keywords.some((keyword) => lowerComments[index].includes(keyword))
  );
}

function limitItems(items: string[], limit: number) {
  return items.slice(0, limit).filter(Boolean);
}

function buildPhraseSet(comments: string[], pattern: RegExp, fallback: string[]) {
  const matched = comments.filter((comment) => pattern.test(comment)).slice(0, 5);
  return matched.length > 0 ? matched : fallback;
}
