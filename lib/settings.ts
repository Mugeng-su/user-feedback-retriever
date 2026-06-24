import { prisma } from "@/lib/prisma";

export type ProviderOption = "auto" | "openai" | "gemini" | "mock";
export type ReasoningEffort = "low" | "medium" | "high";
export type Locale = "en" | "zh";

export type AppSettings = {
  preferredProvider: ProviderOption;
  openaiModel: string;
  geminiModel: string;
  openaiReasoningEffort: ReasoningEffort;
  locale: Locale;
};

const SETTINGS_ID = "default";

export const defaultSettings: AppSettings = {
  preferredProvider: "auto",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.4",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  openaiReasoningEffort: normalizeReasoningEffort(process.env.OPENAI_REASONING_EFFORT),
  locale: "en"
};

export async function getSettings(): Promise<AppSettings> {
  const stored = await prisma.appSettings.findUnique({
    where: { id: SETTINGS_ID }
  });

  if (!stored) {
    return defaultSettings;
  }

  return {
    preferredProvider: normalizeProvider(stored.preferredProvider),
    openaiModel: stored.openaiModel,
    geminiModel: stored.geminiModel,
    openaiReasoningEffort: normalizeReasoningEffort(stored.openaiReasoningEffort),
    locale: normalizeLocale(stored.locale)
  };
}

export async function saveSettings(input: Partial<AppSettings>) {
  const current = await getSettings();
  const next: AppSettings = {
    preferredProvider: normalizeProvider(input.preferredProvider ?? current.preferredProvider),
    openaiModel: normalizeModel(input.openaiModel ?? current.openaiModel, defaultSettings.openaiModel),
    geminiModel: normalizeModel(input.geminiModel ?? current.geminiModel, defaultSettings.geminiModel),
    openaiReasoningEffort: normalizeReasoningEffort(
      input.openaiReasoningEffort ?? current.openaiReasoningEffort
    ),
    locale: normalizeLocale(input.locale ?? current.locale)
  };

  await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      ...next
    },
    update: next
  });

  return next;
}

function normalizeProvider(value: string): ProviderOption {
  if (value === "openai" || value === "gemini" || value === "mock" || value === "auto") {
    return value;
  }

  return "auto";
}

function normalizeReasoningEffort(value: string | undefined): ReasoningEffort {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}

function normalizeModel(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function normalizeLocale(value: string | undefined): Locale {
  if (value === "en" || value === "zh") {
    return value;
  }

  return "en";
}
