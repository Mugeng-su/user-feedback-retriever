"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function saveLocale(nextLocale: Locale) {
    startTransition(async () => {
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ locale: nextLocale })
      });

      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-moss/15 bg-white/70 p-1 shadow-sm">
      <button
        className={`rounded-full px-3 py-1.5 text-sm transition ${
          locale === "en" ? "bg-moss text-sand" : "text-moss hover:bg-sand/80"
        }`}
        disabled={isPending}
        onClick={() => saveLocale("en")}
        type="button"
      >
        EN
      </button>
      <button
        className={`rounded-full px-3 py-1.5 text-sm transition ${
          locale === "zh" ? "bg-moss text-sand" : "text-moss hover:bg-sand/80"
        }`}
        disabled={isPending}
        onClick={() => saveLocale("zh")}
        type="button"
      >
        中文
      </button>
    </div>
  );
}
