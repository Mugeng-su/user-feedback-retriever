"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getMessages, type Locale } from "@/lib/i18n";
import type { AppSettings, ProviderOption, ReasoningEffort } from "@/lib/settings";

type SettingsFormProps = {
  settings: AppSettings;
  hasOpenAIKey: boolean;
  hasGeminiKey: boolean;
  hasYouTubeKey: boolean;
  locale: Locale;
};

export function SettingsForm({
  settings,
  hasOpenAIKey,
  hasGeminiKey,
  hasYouTubeKey,
  locale
}: SettingsFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(settings);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = getMessages(locale);

  function updateField<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setFormState((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formState)
      });

      if (!response.ok) {
        setMessage(t.settingsFailed);
        return;
      }

      setMessage(t.settingsSaved);
      router.refresh();
    });
  }

  return (
    <section className="rounded-[32px] border border-moss/10 bg-white/85 p-6 shadow-[0_16px_60px_rgba(18,33,23,0.06)]">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-moss/65">Settings</p>
        <h1 className="mt-2 text-4xl text-ink">{t.settingsTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-moss/80">
          {t.settingsBody}
        </p>
      </div>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label={t.preferredProvider}>
            <select
              className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
              onChange={(event) =>
                updateField("preferredProvider", event.target.value as ProviderOption)
              }
              value={formState.preferredProvider}
            >
              <option value="auto">Auto</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="mock">Mock</option>
            </select>
          </Field>

          <Field label={t.openaiReasoningEffort}>
            <select
              className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
              onChange={(event) =>
                updateField("openaiReasoningEffort", event.target.value as ReasoningEffort)
              }
              value={formState.openaiReasoningEffort}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </Field>

          <Field label={t.openaiModel}>
            <input
              className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
              onChange={(event) => updateField("openaiModel", event.target.value)}
              value={formState.openaiModel}
            />
          </Field>

          <Field label={t.geminiModel}>
            <input
              className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
              onChange={(event) => updateField("geminiModel", event.target.value)}
              value={formState.geminiModel}
            />
          </Field>

          <Field label={t.language}>
            <select
              className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
              onChange={(event) =>
                updateField("locale", event.target.value as AppSettings["locale"])
              }
              value={formState.locale}
            >
              <option value="en">{t.english}</option>
              <option value="zh">{t.chinese}</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard
            label={t.openaiKey}
            value={hasOpenAIKey ? t.configured : t.missing}
            tone={hasOpenAIKey ? "good" : "warn"}
            hint={t.storedInEnvOpenAI}
          />
          <StatusCard
            label={t.geminiKey}
            value={hasGeminiKey ? t.configured : t.missing}
            tone={hasGeminiKey ? "good" : "warn"}
            hint={t.storedInEnvGemini}
          />
          <StatusCard
            label={t.youtubeKey}
            value={hasYouTubeKey ? t.configured : t.missing}
            tone={hasYouTubeKey ? "good" : "warn"}
            hint={t.storedInEnvYouTube}
          />
        </div>

        <div className="rounded-3xl bg-sand/70 p-5 text-sm leading-7 text-moss/80">
          {t.providerBehavior.split("\n").map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-moss/75">
            {t.providerMissingHint}
          </p>
          <button
            className="rounded-full bg-moss px-6 py-3 text-sm font-semibold text-sand transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? t.saving : t.saveSettings}
          </button>
        </div>

        {message ? <p className="text-sm text-moss">{message}</p> : null}
      </form>
    </section>
  );
}

function Field({
  children,
  label
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-moss/80">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatusCard({
  hint,
  label,
  tone,
  value
}: {
  hint: string;
  label: string;
  tone: "good" | "warn";
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-moss/10 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.2em] text-moss/65">{label}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
            tone === "good"
              ? "bg-leaf text-moss"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {value}
        </span>
      </div>
      <p className="mt-3 text-sm text-moss/75">{hint}</p>
    </div>
  );
}
