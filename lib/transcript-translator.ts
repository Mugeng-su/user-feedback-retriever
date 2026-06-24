import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { AnalysisInput } from "@/lib/schema";
import type { AppSettings } from "@/lib/settings";

let geminiClient: GoogleGenAI | null = null;
let openaiClient: OpenAI | null = null;

export async function ensureEnglishTranscript(
  input: AnalysisInput,
  settings: AppSettings
): Promise<AnalysisInput> {
  if (shouldSkipTranslation(input)) {
    return input;
  }

  const translatedTranscript = await translateTranscript(input.transcript, settings);

  return {
    ...input,
    transcript: translatedTranscript
  };
}

function shouldSkipTranslation(input: AnalysisInput) {
  const language = input.language?.trim().toLowerCase();

  if (language === "en" || language === "english") {
    return true;
  }

  return looksMostlyEnglish(input.transcript);
}

function looksMostlyEnglish(text: string) {
  const letters = text.match(/[A-Za-z]/g)?.length ?? 0;
  const cjk = text.match(/[\u3400-\u9FFF]/g)?.length ?? 0;
  const kana = text.match(/[\u3040-\u30FF]/g)?.length ?? 0;
  const hangul = text.match(/[\uAC00-\uD7AF]/g)?.length ?? 0;
  const totalSignals = letters + cjk + kana + hangul;

  return totalSignals > 0 && letters / totalSignals > 0.75;
}

async function translateTranscript(transcript: string, settings: AppSettings) {
  if (process.env.GEMINI_API_KEY) {
    return translateWithGemini(transcript, settings);
  }

  if (process.env.OPENAI_API_KEY) {
    return translateWithOpenAI(transcript, settings);
  }

  return transcript;
}

async function translateWithGemini(transcript: string, settings: AppSettings) {
  if (!process.env.GEMINI_API_KEY) {
    return transcript;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  const response = await geminiClient.models.generateContent({
    model: settings.geminiModel,
    contents: [
      "Translate the following video transcript to English for content analysis.",
      "If it is already English, return it unchanged.",
      "Preserve timestamps, section ordering, speaker-like line breaks, and concrete product terms.",
      "Return only the translated transcript.",
      "",
      transcript
    ].join("\n")
  });

  return response.text?.trim() || transcript;
}

async function translateWithOpenAI(transcript: string, settings: AppSettings) {
  if (!process.env.OPENAI_API_KEY) {
    return transcript;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  const response = await openaiClient.responses.create({
    model: settings.openaiModel,
    input: [
      {
        role: "system",
        content:
          "Translate video transcripts to English for content analysis. Preserve timestamps, ordering, line breaks, and product terms. Return only the translated transcript."
      },
      {
        role: "user",
        content: transcript
      }
    ]
  });

  return response.output_text.trim() || transcript;
}
