"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getMessages, type Locale } from "@/lib/i18n";
import type { AnalysisInput } from "@/lib/schema";

type FormError = {
  title: string;
  message: string;
  suggestion?: string;
};

type YouTubeMetadataResponse = {
  title?: string;
  channelTitle?: string;
  views?: number;
  likes?: number;
  commentsCount?: number;
};

type YouTubeCommentsResponse = {
  comments?: string[];
  fetchedCount?: number;
};

const initialState: AnalysisInput = {
  title: "",
  platform: "YouTube",
  videoUrl: "",
  productName: "",
  creatorName: "",
  views: undefined,
  likes: undefined,
  commentsCount: undefined,
  transcript: "",
  commentsRaw: "",
  language: "auto"
};

const sampleCases: Record<"strong" | "screened", AnalysisInput> = {
  strong: {
    title: "AirPods Pro 3 Review - 6 Months Later",
    platform: "YouTube",
    videoUrl: "https://youtube.com/watch?v=sample-strong",
    productName: "AirPods Pro 3",
    creatorName: "Long-term tech reviewer",
    views: 286000,
    likes: 18400,
    commentsCount: 1260,
    transcript:
      "00:00 Six months later, I have used AirPods Pro 3 on flights, daily commutes, calls, and workouts. The biggest surprise is not just noise cancellation, but how much more comfortable they feel after long sessions. 00:35 The first thing I noticed was transparency mode. It sounds less processed, so I can keep them in while talking to someone or walking outside. 01:20 Noise cancellation is stronger in low rumble situations like trains and planes, but there is still a software issue some people describe as a hollow ocean sound after extended use. 02:15 Battery life is better for my daily routine. I can get through a workday with short charging breaks, and the case is still easy to carry. 03:10 The Apple ecosystem is the reason I keep coming back. Switching from iPhone to Mac during calls is still the most frictionless part of the experience. 04:05 If you already own the last generation, this is not an automatic upgrade for everyone. But if comfort, transparency, and better daily reliability matter to you, this is the version I would recommend.",
    commentsRaw: [
      "The transparency mode is the reason I want these.",
      "Comfort matters more than people admit. My old ones hurt after an hour.",
      "Battery life sounds good enough for my work day.",
      "That hollow ocean ANC bug happened to me too.",
      "Apple switching between iPhone and Mac is still unmatched.",
      "I need better noise cancellation for flights.",
      "Finally someone talks about long-term comfort instead of just specs.",
      "Are they worth upgrading from Pro 2?",
      "The case size staying small is underrated.",
      "I care more about call quality than bass."
    ].join("\n"),
    language: "en"
  },
  screened: {
    title: "Wireless Microphone Unboxing Preview",
    platform: "YouTube",
    videoUrl: "https://youtube.com/watch?v=sample-screened",
    productName: "Creator Wireless Mic",
    creatorName: "Creator gear account",
    views: 5300,
    likes: 702,
    commentsCount: 16,
    transcript:
      "00:00 Today I am unboxing this wireless microphone kit for creators. 00:20 Inside the box you get two transmitters, one receiver, a charging case, windscreens, and cables. 01:10 The brand says it supports long wireless range and noise reduction. 02:00 Here is a quick look at the buttons and the charging case. 03:00 I will test it outside in another video. 04:00 If you want a small microphone for recording videos, this might be something to consider.",
    commentsRaw: [
      "Need a real sound test.",
      "How is the delay?",
      "This looks like an ad.",
      "Can you compare it with DJI Mic?",
      "No outdoor audio sample?",
      "The case looks nice.",
      "Price?",
      "I cannot tell how it sounds from this video."
    ].join("\n"),
    language: "en"
  }
};

export function AnalysisForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [formData, setFormData] = useState<AnalysisInput>(initialState);
  const [error, setError] = useState<FormError | null>(null);
  const [metadataMessage, setMetadataMessage] = useState<string | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [commentsMessage, setCommentsMessage] = useState<string | null>(null);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const lastAutoFetchedUrl = useRef("");
  const [isPending, startTransition] = useTransition();
  const t = getMessages(locale);

  function updateField<K extends keyof AnalysisInput>(key: K, value: AnalysisInput[K]) {
    setFormData((current) => ({
      ...current,
      [key]: value
    }));
  }

  function loadSampleCase(caseType: keyof typeof sampleCases) {
    setError(null);
    setMetadataMessage(null);
    setCommentsMessage(null);
    lastAutoFetchedUrl.current = sampleCases[caseType].videoUrl ?? "";
    setFormData(sampleCases[caseType]);
  }

  useEffect(() => {
    const videoUrl = formData.videoUrl?.trim() ?? "";

    if (!isYouTubeUrl(videoUrl) || videoUrl === lastAutoFetchedUrl.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastAutoFetchedUrl.current = videoUrl;
      void handleFetchYouTubeMetadata({ silent: true });
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [formData.videoUrl]);

  async function handleFetchYouTubeMetadata(options?: { silent?: boolean }) {
    setError(null);
    setMetadataMessage(null);
    setIsFetchingMetadata(true);

    try {
      const response = await fetch("/api/youtube/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          videoUrl: formData.videoUrl
        })
      });

      const payload = (await response.json()) as YouTubeMetadataResponse & {
        title?: string;
        message?: string;
        suggestion?: string;
      };

      if (!response.ok) {
        if (options?.silent) {
          setMetadataMessage(t.youtubeMetadataFailed);
        } else {
          setError({
            title: payload.title ?? t.youtubeMetadataFailed,
            message: payload.message ?? t.youtubeMetadataFailed,
            suggestion: payload.suggestion
          });
        }
        return;
      }

      setFormData((current) => ({
        ...current,
        platform: "YouTube",
        title: current.title || payload.title || current.title,
        creatorName: current.creatorName || payload.channelTitle || current.creatorName,
        views: payload.views ?? current.views,
        likes: payload.likes ?? current.likes,
        commentsCount: payload.commentsCount ?? current.commentsCount
      }));
      setMetadataMessage(options?.silent ? t.youtubeMetadataAutoLoaded : t.youtubeMetadataLoaded);
    } catch (error) {
      if (options?.silent) {
        setMetadataMessage(t.youtubeMetadataFailed);
      } else {
        setError({
          title: t.youtubeMetadataFailed,
          message: error instanceof Error ? error.message : String(error),
          suggestion:
            locale === "zh"
              ? "请检查本地服务是否正在运行、网络是否可用，以及 .env 是否配置了 YOUTUBE_API_KEY。"
              : "Check that the local server is running, the network is available, and YOUTUBE_API_KEY is configured in .env."
        });
      }
    } finally {
      setIsFetchingMetadata(false);
    }
  }

  async function handleFetchYouTubeComments() {
    setError(null);
    setCommentsMessage(null);
    setIsFetchingComments(true);

    try {
      const response = await fetch("/api/youtube/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          videoUrl: formData.videoUrl,
          maxComments: 100
        })
      });

      const payload = (await response.json()) as YouTubeCommentsResponse & {
        title?: string;
        message?: string;
        suggestion?: string;
      };

      if (!response.ok) {
        setError({
          title: payload.title ?? t.youtubeCommentsFailed,
          message: payload.message ?? t.youtubeCommentsFailed,
          suggestion: payload.suggestion
        });
        return;
      }

      const comments = payload.comments ?? [];

      setFormData((current) => ({
        ...current,
        platform: "YouTube",
        commentsRaw: comments.join("\n")
      }));
      setCommentsMessage(
        t.youtubeCommentsLoaded.replace("{count}", String(payload.fetchedCount ?? comments.length))
      );
    } catch (error) {
      setError({
        title: t.youtubeCommentsFailed,
        message: error instanceof Error ? error.message : String(error),
        suggestion:
          locale === "zh"
            ? "请检查本地服务是否正在运行、网络是否可用，以及 .env 是否配置了 YOUTUBE_API_KEY。"
            : "Check that the local server is running, the network is available, and YOUTUBE_API_KEY is configured in .env."
      });
    } finally {
      setIsFetchingComments(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          title?: string;
          message?: string;
          suggestion?: string;
        };
        setError({
          title: payload.title ?? t.settingsFailed,
          message: payload.message ?? t.settingsFailed,
          suggestion: payload.suggestion
        });
        return;
      }

      const payload = (await response.json()) as { id: string };
      setFormData(initialState);
      router.push(`/analyses/${payload.id}`);
    });
  }

  return (
    <section className="rounded-[34px] border border-moss/10 bg-white/85 p-5 shadow-[0_24px_80px_rgba(18,33,23,0.08)] backdrop-blur">
      <div className="mb-6 rounded-[28px] bg-gradient-to-br from-moss via-moss to-ink p-6 text-sand">
        <p className="text-sm uppercase tracking-[0.2em] text-sand/60">
          {t.newAnalysis}
        </p>
        <h2 className="mt-2 text-3xl text-sand">{t.submitStandoutVideo}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-sand/80">
          {t.formIntro}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            className="rounded-3xl border border-sand/15 bg-sand/10 p-4 text-left transition hover:-translate-y-0.5 hover:bg-sand/15"
            onClick={() => loadSampleCase("strong")}
            type="button"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
              {t.loadStrongSample}
            </span>
            <span className="mt-2 block text-lg text-sand">{t.demoStrongTitle}</span>
            <span className="mt-1 block text-xs leading-5 text-sand/70">
              {t.demoStrongBody}
            </span>
          </button>
          <button
            className="rounded-3xl border border-sand/15 bg-sand/10 p-4 text-left transition hover:-translate-y-0.5 hover:bg-sand/15"
            onClick={() => loadSampleCase("screened")}
            type="button"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
              {t.loadScreenedSample}
            </span>
            <span className="mt-2 block text-lg text-sand">{t.demoScreenedTitle}</span>
            <span className="mt-1 block text-xs leading-5 text-sand/70">
              {t.demoScreenedBody}
            </span>
          </button>
        </div>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <StepPanel
          description={t.formStepLinkBody}
          index="01"
          title={t.formStepLinkTitle}
        >
          <Field label={t.videoUrl} required>
            <div className="grid gap-2">
              <input
                className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
                onChange={(event) => updateField("videoUrl", event.target.value)}
                placeholder={t.videoUrlPlaceholder}
                value={formData.videoUrl ?? ""}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs leading-5 text-moss/65">{t.youtubeAutoFetchHint}</p>
                <button
                  className="rounded-full border border-moss/15 bg-white px-3 py-1.5 text-xs font-semibold text-moss transition hover:border-moss/35 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isFetchingMetadata || !formData.videoUrl}
                  onClick={() => handleFetchYouTubeMetadata()}
                  type="button"
                >
                  {isFetchingMetadata ? t.fetchingYouTubeMetadata : t.refetchYouTubeMetadata}
                </button>
              </div>
              {metadataMessage ? (
                <p className="text-xs leading-5 text-moss/70">{metadataMessage}</p>
              ) : null}
            </div>
          </Field>
        </StepPanel>

        <StepPanel
          description={t.formStepContextBody}
          index="02"
          title={t.formStepContextTitle}
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_160px]">
            <Field label={t.videoTitle} required>
              <input
                className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
                onChange={(event) => updateField("title", event.target.value)}
                placeholder={t.titlePlaceholder}
                value={formData.title}
              />
            </Field>
            <Field label={t.productName}>
              <input
                className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
                onChange={(event) => updateField("productName", event.target.value)}
                placeholder={t.productPlaceholder}
                value={formData.productName ?? ""}
              />
            </Field>
            <Field label={t.platform} required>
              <select
                className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
                onChange={(event) => updateField("platform", event.target.value)}
                value={formData.platform}
              >
                <option value="YouTube">YouTube</option>
              </select>
            </Field>
            <Field label={t.sourceLanguage}>
              <input
                className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
                onChange={(event) => updateField("language", event.target.value)}
                placeholder="auto"
                value={formData.language ?? "auto"}
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <MetricInput label={t.views} onChange={(value) => updateField("views", value)} value={formData.views} />
            <MetricInput label={t.likes} onChange={(value) => updateField("likes", value)} value={formData.likes} />
            <MetricInput
              label={t.comments}
              onChange={(value) => updateField("commentsCount", value)}
              value={formData.commentsCount}
            />
          </div>
        </StepPanel>

        <StepPanel
          description={t.formStepEvidenceBody}
          index="03"
          title={t.formStepEvidenceTitle}
        >
          <Field label={t.transcript} required>
            <textarea
              className="min-h-52 w-full rounded-[24px] border border-moss/15 bg-sand/50 px-4 py-4 outline-none transition focus:border-moss/40 focus:bg-white"
              onChange={(event) => updateField("transcript", event.target.value)}
              placeholder={t.transcriptPlaceholder}
              value={formData.transcript}
            />
          </Field>

          <div className="mt-5">
            <Field label={t.comments} required>
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs leading-5 text-moss/65">{t.youtubeCommentsHint}</p>
                  <button
                    className="rounded-full border border-moss/15 bg-white px-4 py-2 text-xs font-semibold text-moss transition hover:border-moss/35 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isFetchingComments || !formData.videoUrl}
                    onClick={handleFetchYouTubeComments}
                    type="button"
                  >
                    {isFetchingComments ? t.fetchingYouTubeComments : t.fetchYouTubeComments}
                  </button>
                </div>
                <textarea
                  className="min-h-56 w-full rounded-[24px] border border-moss/15 bg-sand/50 px-4 py-4 outline-none transition focus:border-moss/40 focus:bg-white"
                  onChange={(event) => updateField("commentsRaw", event.target.value)}
                  placeholder={t.commentsPlaceholder}
                  value={formData.commentsRaw}
                />
                {commentsMessage ? (
                  <p className="text-xs leading-5 text-moss/70">{commentsMessage}</p>
                ) : null}
              </div>
            </Field>
          </div>
        </StepPanel>

        <StepPanel
          description={t.formStepRunBody}
          index="04"
          title={t.formStepRunTitle}
        >
          {error ? (
            <div className="rounded-2xl border border-ember/20 bg-ember/10 px-4 py-4 text-sm text-ember">
              <p className="font-semibold">{error.title}</p>
              <p className="mt-2 whitespace-pre-line leading-6">{error.message}</p>
              {error.suggestion ? (
                <p className="mt-2 leading-6 text-ember/85">{error.suggestion}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-7 text-moss/75">
              {t.analyzerHint}
            </p>
            <button
              className="rounded-full bg-moss px-7 py-3 text-sm font-semibold text-sand shadow-[0_12px_32px_rgba(38,71,51,0.22)] transition hover:-translate-y-0.5 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? t.analyzing : t.runAnalysis}
            </button>
          </div>
        </StepPanel>
      </form>
    </section>
  );
}

function StepPanel({
  children,
  description,
  index,
  title
}: {
  children: React.ReactNode;
  description: string;
  index: string;
  title: string;
}) {
  return (
    <section className="rounded-[28px] border border-moss/10 bg-white/80 p-5 shadow-[0_10px_36px_rgba(18,33,23,0.045)]">
      <div className="mb-5 flex flex-wrap items-start gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-leaf text-sm font-semibold text-moss">
          {index}
        </span>
        <div>
          <h3 className="text-xl text-ink">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-moss/70">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  children,
  label,
  required
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-moss/80">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function MetricInput({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: number | undefined) => void;
  value: number | undefined;
}) {
  return (
    <Field label={label}>
      <input
        className="w-full rounded-2xl border border-moss/15 bg-sand/50 px-4 py-3 outline-none transition focus:border-moss/40 focus:bg-white"
        min="0"
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue ? Number(nextValue) : undefined);
        }}
        type="number"
        value={value ?? ""}
      />
    </Field>
  );
}

function isYouTubeUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    return ["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(host);
  } catch {
    return false;
  }
}
