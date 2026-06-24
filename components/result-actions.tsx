"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CopyButtonProps = {
  copiedLabel: string;
  label: string;
  text: string;
};

type BriefExportPanelProps = {
  briefText: string;
  copyLabel: string;
  copiedLabel: string;
  downloadLabel: string;
  filename: string;
  title: string;
};

type ReanalyzeButtonProps = {
  analysisId: string;
  failedLabel: string;
  label: string;
  loadingLabel: string;
};

export function CopyButton({ copiedLabel, label, text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      className="rounded-full border border-moss/15 bg-white/75 px-3 py-1.5 text-xs font-semibold text-moss transition hover:border-moss/35 hover:text-ink"
      onClick={handleCopy}
      type="button"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

export function BriefExportPanel({
  briefText,
  copyLabel,
  copiedLabel,
  downloadLabel,
  filename,
  title
}: BriefExportPanelProps) {
  function handleDownload() {
    const blob = new Blob([briefText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-[24px] border border-moss/10 bg-white/75 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl text-ink">{title}</h3>
        <div className="flex flex-wrap gap-2">
          <CopyButton copiedLabel={copiedLabel} label={copyLabel} text={briefText} />
          <button
            className="rounded-full border border-moss/15 bg-white/75 px-3 py-1.5 text-xs font-semibold text-moss transition hover:border-moss/35 hover:text-ink"
            onClick={handleDownload}
            type="button"
          >
            {downloadLabel}
          </button>
        </div>
      </div>
      <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-sand/60 p-4 text-sm leading-7 text-moss/85">
        {briefText}
      </pre>
    </section>
  );
}

export function ReanalyzeButton({
  analysisId,
  failedLabel,
  label,
  loadingLabel
}: ReanalyzeButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReanalyze() {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/analyses/${analysisId}/rerun`, {
        method: "POST"
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          message?: string;
          suggestion?: string;
          title?: string;
        };

        setError([payload.title, payload.message, payload.suggestion].filter(Boolean).join(" "));
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <button
        className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-sand transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={handleReanalyze}
        type="button"
      >
        {isPending ? loadingLabel : label}
      </button>
      {error ? (
        <p className="mt-2 max-w-xl text-sm leading-6 text-ember">
          {failedLabel}: {error}
        </p>
      ) : null}
    </div>
  );
}
