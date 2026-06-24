import Link from "next/link";
import { listAnalyses } from "@/lib/analysis-store";
import { AnalysisForm } from "@/components/analysis-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const analyses = await listAnalyses();
  const settings = await getSettings();
  const t = getMessages(settings.locale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-moss shadow-sm">
          {t.v1Workbench}
        </div>
        <div className="flex flex-wrap gap-3">
          <LanguageSwitcher locale={settings.locale} />
          <Link
            className="rounded-full border border-moss/15 bg-white/70 px-4 py-2 text-sm text-moss transition hover:border-moss/35"
            href="/settings"
          >
            {t.settings}
          </Link>
        </div>
      </div>
      <section className="grid gap-6 rounded-[32px] border border-moss/10 bg-white/80 p-8 shadow-[0_20px_80px_rgba(38,71,51,0.08)] backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-leaf px-3 py-1 text-sm tracking-wide text-moss">
            {t.v1Workbench}
          </span>
          <div className="space-y-3">
            <h1 className="max-w-2xl text-4xl leading-tight text-ink md:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-moss/85">
              {t.heroBody}
            </p>
          </div>
          <div className="grid gap-3 text-sm text-moss/80 md:grid-cols-3">
            <div className="rounded-2xl border border-moss/10 bg-sand/70 p-4">
              <p className="font-semibold text-ink">{t.cardVideoBreakdown}</p>
              <p>{t.cardVideoBreakdownBody}</p>
            </div>
            <div className="rounded-2xl border border-moss/10 bg-sand/70 p-4">
              <p className="font-semibold text-ink">{t.cardCommentIntelligence}</p>
              <p>{t.cardCommentIntelligenceBody}</p>
            </div>
            <div className="rounded-2xl border border-moss/10 bg-sand/70 p-4">
              <p className="font-semibold text-ink">{t.cardReusableLanguage}</p>
              <p>{t.cardReusableLanguageBody}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-moss p-6 text-sand">
          <p className="text-sm uppercase tracking-[0.2em] text-leaf/80">
            {t.suggestedWorkflow}
          </p>
          <ol className="mt-4 space-y-4 text-sm leading-7">
            <li>{t.workflow1}</li>
            <li>{t.workflow2}</li>
            <li>{t.workflow3}</li>
          </ol>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <AnalysisForm locale={settings.locale} />

        <aside className="space-y-4 rounded-[28px] border border-moss/10 bg-white/75 p-6 shadow-[0_16px_60px_rgba(18,33,23,0.06)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-ink">{t.recentAnalyses}</h2>
            <span className="rounded-full bg-leaf px-3 py-1 text-xs text-moss">
              {analyses.length} {t.total}
            </span>
          </div>
          <div className="space-y-3">
            {analyses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-moss/20 bg-sand/60 p-5 text-sm leading-7 text-moss/75">
                {t.noAnalyses}
              </div>
            ) : (
              analyses.map((analysis) => (
                <Link
                  className="block rounded-2xl border border-moss/10 bg-sand/60 p-4 transition hover:-translate-y-0.5 hover:border-moss/30"
                  href={`/analyses/${analysis.id}`}
                  key={analysis.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg text-ink">{analysis.title}</p>
                      <p className="text-sm text-moss/75">
                        {analysis.platform}
                        {analysis.creatorName ? ` · ${analysis.creatorName}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-wide text-moss">
                      {analysis.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
