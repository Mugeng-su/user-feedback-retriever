import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getAnalysis } from "@/lib/analysis-store";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  BriefExportPanel,
  CopyButton,
  ReanalyzeButton
} from "@/components/result-actions";
import { getMessages } from "@/lib/i18n";
import { normalizeAnalysisResult, normalizeDisplayText } from "@/lib/result-view-model";
import { getSettings } from "@/lib/settings";

type DetailPageProps = {
  params: {
    id: string;
  };
};

export default async function AnalysisDetailPage({ params }: DetailPageProps) {
  const analysis = await getAnalysis(params.id);
  const settings = await getSettings();
  const t = getMessages(settings.locale);

  if (!analysis) {
    notFound();
  }

  const result = analysis.resultJson
    ? normalizeAnalysisResult(analysis.resultJson, settings.locale)
    : null;
  const briefText = result ? buildBriefMarkdown(analysis, result, t) : "";
  const shouldSkipDetails = result ? isDetailedAnalysisSkipped(result) : false;
  const screeningSummary = result ? buildScreeningSummary(result, t) : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm text-moss/80 hover:text-moss" href="/">
            {t.backToWorkspace}
          </Link>
          <h1 className="mt-2 text-4xl text-ink">{analysis.title}</h1>
          <p className="mt-2 text-moss/80">
            {analysis.platform}
            {analysis.creatorName ? ` · ${analysis.creatorName}` : ""}
            {analysis.productName ? ` · ${analysis.productName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={settings.locale} />
          <div className="rounded-2xl border border-moss/10 bg-white/80 px-4 py-3 text-sm text-moss shadow-sm">
            {t.status}: <span className="font-semibold uppercase">{analysis.status}</span>
            {analysis.providerUsed ? (
              <>
                {" · "}Provider:{" "}
                <span className="font-semibold uppercase">{analysis.providerUsed}</span>
              </>
            ) : null}
          </div>
          {result ? (
            <ReanalyzeButton
              analysisId={analysis.id}
              failedLabel={t.reanalyzeFailed}
              label={t.reanalyze}
              loadingLabel={t.reanalyzing}
            />
          ) : null}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t.views} value={formatNumber(analysis.views)} />
        <MetricCard label={t.likes} value={formatNumber(analysis.likes)} />
        <MetricCard label={t.comments} value={formatNumber(analysis.commentsCount)} />
      </section>

      {analysis.status !== "completed" || !result ? (
        <section className="rounded-[28px] border border-moss/10 bg-white/80 p-8 shadow-[0_12px_48px_rgba(18,33,23,0.06)]">
          <h2 className="text-2xl text-ink">{t.analysisInProgress}</h2>
          <p className="mt-3 max-w-2xl text-moss/80">{t.analysisInProgressBody}</p>
          {analysis.errorMessage ? (
            <div className="mt-5 rounded-2xl border border-ember/20 bg-ember/10 px-4 py-4 text-sm text-ember">
              <p className="font-semibold">{t.analysisErrorDetails}</p>
              <p className="mt-2 leading-6">{analysis.errorMessage}</p>
            </div>
          ) : null}
        </section>
      ) : (
        <>
          <section className="rounded-[28px] border border-moss/10 bg-white/80 p-6 shadow-[0_12px_48px_rgba(18,33,23,0.06)]">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-moss/65">{t.reportGuide}</p>
                <h2 className="mt-2 text-3xl leading-tight text-ink">
                  {t.videoSubject}: {buildVideoSubject(analysis)}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-moss/80">
                  {shouldSkipDetails ? t.screeningReportGuideBody : t.reportGuideBody}
                </p>
                <DecisionSummaryPanel
                  result={result}
                  screeningSummary={screeningSummary}
                  shouldSkipDetails={shouldSkipDetails}
                  t={t}
                />
                {shouldSkipDetails && screeningSummary ? (
                  <div className="mt-5 rounded-[20px] border border-ember/15 bg-ember/10 p-4">
                    <p className="text-sm font-semibold text-ink">{t.screeningStoppedLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-moss/80">
                      {screeningSummary.body}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[20px] border border-moss/10 bg-sand/45 p-4">
                    <p className="text-sm font-semibold text-ink">{t.readingRoute}</p>
                    <p className="mt-2 text-sm leading-7 text-moss/80">{t.readingRouteBody}</p>
                  </div>
                )}
                <div className="mt-5">
                  <BriefExportPanel
                    briefText={briefText}
                    copiedLabel={t.copied}
                    copyLabel={t.copyBrief}
                    downloadLabel={t.downloadBrief}
                    filename={`${slugify(analysis.title)}-brief.md`}
                    title={t.exportBrief}
                  />
                </div>
              </div>
              {shouldSkipDetails ? (
                <SkippedDetailedAnalysisCard result={result} t={t} />
              ) : (
                <div className="grid gap-4">
                  <ReportRouteCard
                    contains={t.macroVideoAnalysisContains}
                    href="#video-analysis"
                    label={t.macroVideoAnalysis}
                    sublabel={t.macroVideoAnalysisBody}
                  />
                  <ReportRouteCard
                    contains={t.macroLanguageReuseContains}
                    href="#language-reuse"
                    label={t.macroLanguageReuse}
                    sublabel={t.macroLanguageReuseBody}
                  />
                </div>
              )}
            </div>
          </section>

          {shouldSkipDetails ? null : (
            <>
              <MacroShell
                contains={t.macroVideoAnalysisContains}
                id="video-analysis"
                title={t.macroVideoAnalysis}
                description={t.macroVideoAnalysisBody}
                topLabel={t.backToTop}
              >
            <SectionShell
              id="decision"
              eyebrow={t.jumpTo}
              title={t.groupDecision}
              description={t.groupDecisionBody}
            >
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-[24px] bg-sand/70 p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-moss/65">{t.keyTakeaways}</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-moss/85">
                    {result.summary.keyTakeaways.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-[24px] bg-white/70 p-6 ring-1 ring-moss/10">
                  <h3 className="text-2xl text-ink">{t.nextContentSuggestions}</h3>
                  <p className="mt-3 text-sm leading-7 text-moss/75">{t.nextDirectionsPurpose}</p>
                  <div className="mt-4 space-y-4">
                    {result.nextContentSuggestions.contentDirections.map((direction) => (
                      <div className="rounded-2xl bg-sand/70 p-4" key={direction.direction}>
                        <h4 className="text-lg text-ink">{direction.direction}</h4>
                        <p className="mt-2 text-sm leading-7 text-moss/85">
                          {direction.why_this_direction}
                        </p>
                        {direction.supporting_signals.length > 0 ? (
                          <div className="mt-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-moss/60">
                              {t.selectedBecause}
                            </p>
                            <ul className="mt-2 space-y-2 text-sm text-moss/75">
                              {direction.supporting_signals.map((signal: string) => (
                                <li key={signal}>• {signal}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </SectionShell>

            <SectionShell
              id="mechanics"
              eyebrow={t.jumpTo}
              title={t.groupMechanics}
              description={t.groupMechanicsBody}
            >
              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[24px] bg-white/70 p-6 ring-1 ring-moss/10">
                  <h3 className="text-2xl text-ink">{t.whyItWorked}</h3>
                  <div className="mt-4 grid gap-4">
                    <InsightGroup items={result.whyItWorked.contentHook} title={t.contentHook} />
                    <InsightGroup items={result.whyItWorked.trustAndProof} title={t.trustAndProof} />
                    <InsightGroup
                      items={result.whyItWorked.audienceResonance}
                      title={t.audienceResonance}
                    />
                    <InsightGroup
                      items={result.whyItWorked.reusableFactors}
                      title={t.reusableFactors}
                    />
                    <InsightGroup
                      items={result.whyItWorked.contextualFactors}
                      title={t.contextualFactors}
                    />
                  </div>
                </section>

                <section className="rounded-[24px] bg-sand/70 p-6">
                  <h3 className="text-2xl text-ink">{t.videoBreakdown}</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <DetailPanel label={t.structureSummary} value={result.videoBreakdown.structureSummary} />
                    <DetailPanel label={t.pacing} value={result.videoBreakdown.pacingAssessment} />
                  </div>
                  <div className="mt-5 space-y-4">
                    {result.videoBreakdown.sections.map((section) => (
                      <div className="rounded-2xl bg-white/80 p-4" key={`${section.label}-${section.start_time}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h4 className="text-lg text-ink">{section.label}</h4>
                          <div className="text-right text-xs uppercase tracking-[0.18em] text-moss/60">
                            <p>
                              {t.sectionTiming}: {section.start_time} - {section.end_time}
                            </p>
                            <p>
                              {t.durationShare}: {section.duration_ratio}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-moss/85">{section.summary}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </SectionShell>

            <SectionShell
              id="audience"
              eyebrow={t.jumpTo}
              title={t.groupAudience}
              description={t.groupAudienceBody}
            >
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[24px] bg-white/70 p-6 ring-1 ring-moss/10">
                  <h3 className="text-2xl text-ink">{t.commentInsights}</h3>
                  <p className="mt-3 text-sm leading-7 text-moss/75">{t.commentInsightsPurpose}</p>
                  <div className="mt-4 space-y-4">
                    {result.commentInsights.topTopics.map((topic) => (
                      <div className="rounded-2xl bg-sand/70 p-4" key={topic.topic}>
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-lg text-ink">{topic.topic}</h4>
                          <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-wide text-moss">
                            {topic.sentiment}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-moss/85">{topic.description}</p>
                        <ul className="mt-3 space-y-2 text-sm text-moss/75">
                          {topic.example_comments.map((comment: string) => (
                            <li key={comment}>“{normalizeDisplayText(comment)}”</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid gap-4">
                  <MiniListCard title={t.topPraises} items={result.commentInsights.topPraises} />
                  <MiniListCard
                    title={t.topObjections}
                    items={result.commentInsights.topObjections}
                  />
                  <MiniListCard
                    title={t.featureRequests}
                    items={result.commentInsights.featureRequests}
                  />
                  <MiniListCard
                    title={t.painPointPhrases}
                    items={result.userLanguageLibrary.painPointPhrases}
                  />
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="actions"
              eyebrow={t.jumpTo}
              title={t.groupActions}
              description={t.groupActionsBody}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <MiniListCard
                  title={`${t.reusablePrefix} · ${t.reusableFactors}`}
                  items={result.nextContentSuggestions.doMore}
                />
                <MiniListCard
                  title={`${t.watchoutPrefix} · ${t.contextualFactors}`}
                  items={result.nextContentSuggestions.avoid}
                />
              </div>
            </SectionShell>
              </MacroShell>

              <MacroShell
                contains={t.macroLanguageReuseContains}
                id="language-reuse"
                title={t.macroLanguageReuse}
                description={t.macroLanguageReuseBody}
                topLabel={t.backToTop}
              >
            <SectionShell
              id="language"
              eyebrow={t.jumpTo}
              title={t.groupLanguage}
              description={t.groupLanguageBody}
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <PurposeGroupCard
                  copiedLabel={t.copied}
                  copyLabel={t.copy}
                  groups={result.userLanguageLibrary.rawQuoteGroups}
                  purpose={t.rawQuotesPurpose}
                  title={t.rawQuotes}
                />
                <PurposeGroupCard
                  copiedLabel={t.copied}
                  copyLabel={t.copy}
                  groups={result.userLanguageLibrary.painPointExpressionGroups}
                  purpose={t.benefitPhrasesPurpose}
                  title={t.benefitPhrases}
                />
                <PurposeGroupCard
                  copiedLabel={t.copied}
                  copyLabel={t.copy}
                  groups={result.userLanguageLibrary.seoPhraseGroups}
                  purpose={t.seoPhrasesPurpose}
                  title={t.seoPhrases}
                />
              </div>
            </SectionShell>
              </MacroShell>
            </>
          )}
        </>
      )}
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-moss/10 bg-white/80 p-5 shadow-[0_8px_32px_rgba(18,33,23,0.06)]">
      <p className="text-sm uppercase tracking-[0.2em] text-moss/65">{label}</p>
      <p className="mt-3 text-3xl text-ink">{value}</p>
    </div>
  );
}

function DecisionSummaryPanel({
  result,
  screeningSummary,
  shouldSkipDetails,
  t
}: {
  result: ReturnType<typeof normalizeAnalysisResult>;
  screeningSummary: { title: string; body: string } | null;
  shouldSkipDetails: boolean;
  t: ReturnType<typeof getMessages>;
}) {
  const decision = getReplicationDecision(result, t);
  const evidence = result.evidenceAssessment.available
    ? getEvidenceModeDisplay(result, t)
    : null;

  return (
    <section className="mt-6 overflow-hidden rounded-[26px] border border-moss/10 bg-gradient-to-br from-white via-leaf/30 to-sand/70 shadow-[0_18px_54px_rgba(18,33,23,0.08)]">
      <div className="border-b border-moss/10 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${decision.className}`}>
            {decision.label}
          </span>
          {evidence ? (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${evidence.className}`}>
              {evidence.label}
            </span>
          ) : null}
        </div>
        <h3 className="mt-4 text-3xl leading-tight text-ink">
          {shouldSkipDetails && screeningSummary
            ? screeningSummary.title
            : result.summary.oneLiner}
        </h3>
        <p className="mt-3 text-sm leading-7 text-moss/80">
          {shouldSkipDetails && screeningSummary
            ? screeningSummary.body
            : decision.title}
        </p>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-2">
        <DecisionMiniCard
          body={formatPerformanceReason(result, t)}
          title={t.replicationDecision}
        />
        <DecisionMiniCard
          body={evidence ? evidence.body : t.evidenceUnavailable}
          title={t.evidenceAssessment}
        />
      </div>
      <div className="grid gap-3 border-t border-moss/10 bg-white/50 p-5 text-sm text-moss/80 md:grid-cols-3">
        <MetricPill label={t.replicationConfidence} value={result.performanceAssessment.replicationConfidence} />
        <MetricPill label={t.likeRate} value={formatPercent(result.performanceAssessment.likeRate)} />
        <MetricPill label={t.commentRate} value={formatPercent(result.performanceAssessment.commentRate)} />
      </div>
    </section>
  );
}

function DecisionMiniCard({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-moss/10">
      <p className="text-xs uppercase tracking-[0.16em] text-moss/55">{title}</p>
      <p className="mt-2 text-sm leading-6 text-moss/80">{body}</p>
    </div>
  );
}

function PerformanceAssessmentCard({
  result,
  t
}: {
  result: ReturnType<typeof normalizeAnalysisResult>;
  t: ReturnType<typeof getMessages>;
}) {
  const assessment = result.performanceAssessment;
  const decision = getReplicationDecision(result, t);

  return (
    <div className="mt-5 rounded-[20px] border border-moss/10 bg-white/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{t.replicationDecision}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-moss/60">
            {t.performanceBasedOnInput}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${decision.className}`}>
          {decision.label}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold text-ink">{decision.title}</p>
      <p className="mt-3 text-sm leading-7 text-moss/80">
        {formatPerformanceReason(result, t)}
      </p>
      <div className="mt-4 grid gap-3 text-sm text-moss/80 md:grid-cols-3">
        <MetricPill label={t.replicationConfidence} value={assessment.replicationConfidence} />
        <MetricPill label={t.likeRate} value={formatPercent(assessment.likeRate)} />
        <MetricPill label={t.commentRate} value={formatPercent(assessment.commentRate)} />
      </div>
      {assessment.dataWarnings.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-sand/60 p-3 text-sm leading-6 text-moss/80">
          <p className="font-semibold text-ink">{t.dataWarnings}</p>
          <ul className="mt-2 space-y-1">
            {assessment.dataWarnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function SkippedDetailedAnalysisCard({
  result,
  t
}: {
  result: ReturnType<typeof normalizeAnalysisResult>;
  t: ReturnType<typeof getMessages>;
}) {
  const isInsufficientData = result.performanceAssessment.level === "insufficient_data";
  const isEvidenceBlocked = result.evidenceAssessment.mode === "insufficient_evidence";

  return (
    <section className="rounded-[24px] border border-ember/15 bg-ember/10 p-6 text-ember">
      <p className="text-sm uppercase tracking-[0.18em] text-ember/70">
        {t.screeningStoppedLabel}
      </p>
      <h3 className="mt-3 text-2xl text-ink">
        {isEvidenceBlocked
          ? t.screeningEvidenceTitle
          : isInsufficientData
            ? t.screeningInsufficientTitle
            : t.screeningLowTitle}
      </h3>
      <p className="mt-3 text-sm leading-7 text-moss/85">
        {isEvidenceBlocked
          ? t.screeningEvidenceBody
          : isInsufficientData
            ? t.screeningInsufficientBody
            : t.screeningLowBody}
      </p>
      <p className="mt-4 rounded-2xl bg-white/65 p-4 text-sm leading-7 text-moss/80">
        {t.screeningNextStep}
      </p>
    </section>
  );
}

function EvidenceAssessmentCard({
  result,
  t
}: {
  result: ReturnType<typeof normalizeAnalysisResult>;
  t: ReturnType<typeof getMessages>;
}) {
  const evidence = result.evidenceAssessment;
  const mode = getEvidenceModeDisplay(result, t);

  return (
    <div className="mt-5 rounded-[20px] border border-moss/10 bg-white/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{t.evidenceAssessment}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-moss/60">
            {t.basedOnTranscriptAndComments}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${mode.className}`}>
          {mode.label}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold text-ink">{mode.title}</p>
      <p className="mt-3 text-sm leading-7 text-moss/80">{mode.body}</p>
      <div className="mt-4 grid gap-3 text-sm text-moss/80 md:grid-cols-3">
        <MetricPill
          label={t.transcriptChars}
          value={formatNumber(evidence.transcriptCharCount)}
        />
        <MetricPill label={t.commentSamples} value={formatNumber(evidence.commentCount)} />
        <MetricPill
          label={t.commentTextVolume}
          value={formatNumber(evidence.commentCharCount)}
        />
      </div>
      {evidence.evidenceWarnings.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-sand/60 p-3 text-sm leading-6 text-moss/80">
          <p className="font-semibold text-ink">{t.evidenceWarnings}</p>
          <ul className="mt-2 space-y-1">
            {evidence.evidenceWarnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-sand/60 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.14em] text-moss/55">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function ReportRouteCard({
  href,
  label,
  sublabel,
  contains
}: {
  href: string;
  label: string;
  sublabel: string;
  contains: string;
}) {
  return (
    <a
      className="block rounded-[22px] border border-moss/10 bg-sand/60 px-5 py-4 text-sm text-moss transition hover:border-moss/25 hover:bg-sand/80"
      href={href}
    >
      <p className="text-lg font-semibold text-ink">{label}</p>
      <p className="mt-2 leading-6 text-moss/75">{sublabel}</p>
      <p className="mt-3 border-t border-moss/10 pt-3 text-xs uppercase tracking-[0.16em] text-moss/60">
        {contains}
      </p>
    </a>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-[28px] border border-moss/10 bg-white/80 p-6 shadow-[0_12px_48px_rgba(18,33,23,0.06)]"
      id={id}
    >
      <div className="mb-5 border-b border-moss/10 pb-5">
        <p className="text-sm uppercase tracking-[0.2em] text-moss/65">{eyebrow}</p>
        <h2 className="mt-2 text-3xl text-ink">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-moss/80">{description}</p>
      </div>
      {children}
    </section>
  );
}

function MacroShell({
  id,
  title,
  description,
  contains,
  topLabel,
  children
}: {
  id: string;
  title: string;
  description: string;
  contains: string;
  topLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-l-4 border-moss/25 pl-4 md:pl-6" id={id}>
      <div className="rounded-[28px] border border-moss/15 bg-gradient-to-br from-white via-moss/[0.045] to-sand/45 px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-moss/60">{contains}</p>
            <h2 className="mt-3 text-4xl leading-tight text-ink">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-moss/80">{description}</p>
          </div>
          <a
            className="w-fit rounded-full border border-moss/15 bg-white/70 px-4 py-2 text-sm text-moss transition hover:border-moss/30 hover:text-ink"
            href="#"
          >
            ↑ {topLabel}
          </a>
        </div>
      </div>
      {children}
    </section>
  );
}

function InsightGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-sand/70 p-4">
      <h4 className="text-lg text-ink">{title}</h4>
      <ul className="mt-3 space-y-3 text-sm leading-7 text-moss/85">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function DetailPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-moss/60">{label}</p>
      <p className="mt-2 text-sm leading-7 text-moss/85">{value}</p>
    </div>
  );
}

function MiniListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[24px] bg-sand/70 p-5">
      <h3 className="text-xl text-ink">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-moss/85">
        {items.map((item) => (
          <li key={item}>• {normalizeDisplayText(item)}</li>
        ))}
      </ul>
    </section>
  );
}

function PurposeGroupCard({
  title,
  purpose,
  groups,
  copyLabel,
  copiedLabel
}: {
  title: string;
  purpose: string;
  copyLabel: string;
  copiedLabel: string;
  groups: Array<{
    sellingPoint: string;
    phrases: string[];
  }>;
}) {
  return (
    <section className="rounded-[24px] bg-sand/70 p-6">
      <h3 className="text-2xl text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-moss/75">{purpose}</p>
      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <div className="rounded-2xl bg-white/70 p-4" key={group.sellingPoint}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{group.sellingPoint}</p>
              <CopyButton
                copiedLabel={copiedLabel}
                label={copyLabel}
                text={formatLanguageGroupForCopy(group)}
              />
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-moss/85">
              {group.phrases.map((item) => (
                <li key={item}>• {normalizeDisplayText(item)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatNumber(value: number | null) {
  if (!value) {
    return "—";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "—";
  }

  const normalizedValue = value > 1 ? value / 100 : value;

  return `${(normalizedValue * 100).toFixed(2)}%`;
}

function buildVideoSubject(analysis: {
  title: string;
  productName: string | null;
  creatorName: string | null;
}) {
  const parts = [
    analysis.title,
    analysis.productName ? `Product: ${analysis.productName}` : null,
    analysis.creatorName ? `Creator: ${analysis.creatorName}` : null
  ].filter(Boolean);

  return parts.join(" · ");
}

function buildBriefMarkdown(
  analysis: {
    title: string;
    platform: string;
    productName: string | null;
    creatorName: string | null;
  },
  result: ReturnType<typeof normalizeAnalysisResult>,
  t: ReturnType<typeof getMessages>
) {
  if (isDetailedAnalysisSkipped(result)) {
    const screeningSummary = buildScreeningSummary(result, t);

    return [
      `# ${analysis.title}`,
      "",
      `- ${t.platform}: ${analysis.platform}`,
      analysis.productName ? `- ${t.productName}: ${analysis.productName}` : null,
      analysis.creatorName ? `- ${t.creatorName}: ${analysis.creatorName}` : null,
      "",
      `## ${t.performanceAssessment}`,
      `- ${t.performanceLevel}: ${result.performanceAssessment.level}`,
      `- ${t.replicationConfidence}: ${result.performanceAssessment.replicationConfidence}`,
      `- ${t.likeRate}: ${formatPercent(result.performanceAssessment.likeRate)}`,
      `- ${t.commentRate}: ${formatPercent(result.performanceAssessment.commentRate)}`,
      `- ${formatPerformanceReason(result, t)}`,
      ...(result.evidenceAssessment.available
        ? [
            "",
            `## ${t.evidenceAssessment}`,
            `- ${t.analysisMode}: ${getEvidenceModeDisplay(result, t).title}`,
            `- ${t.transcriptChars}: ${formatNumber(result.evidenceAssessment.transcriptCharCount)}`,
            `- ${t.commentSamples}: ${formatNumber(result.evidenceAssessment.commentCount)}`,
            `- ${t.commentTextVolume}: ${formatNumber(result.evidenceAssessment.commentCharCount)}`
          ]
        : []),
      "",
      `## ${t.screeningStoppedLabel}`,
      screeningSummary.title,
      `- ${screeningSummary.body}`,
      `- ${t.screeningNextStep}`
    ]
      .filter((line) => line !== null)
      .join("\n");
  }

  return [
    `# ${analysis.title}`,
    "",
    `- ${t.platform}: ${analysis.platform}`,
    analysis.productName ? `- ${t.productName}: ${analysis.productName}` : null,
    analysis.creatorName ? `- ${t.creatorName}: ${analysis.creatorName}` : null,
    "",
    `## ${t.oneLineTakeaway}`,
    result.summary.oneLiner,
    "",
    `## ${t.performanceAssessment}`,
    `- ${t.performanceLevel}: ${result.performanceAssessment.level}`,
    `- ${t.replicationConfidence}: ${result.performanceAssessment.replicationConfidence}`,
    `- ${t.likeRate}: ${formatPercent(result.performanceAssessment.likeRate)}`,
    `- ${t.commentRate}: ${formatPercent(result.performanceAssessment.commentRate)}`,
    `- ${formatPerformanceReason(result, t)}`,
    ...(result.evidenceAssessment.available
      ? [
          "",
          `## ${t.evidenceAssessment}`,
          `- ${t.analysisMode}: ${getEvidenceModeDisplay(result, t).title}`,
          `- ${t.transcriptChars}: ${formatNumber(result.evidenceAssessment.transcriptCharCount)}`,
          `- ${t.commentSamples}: ${formatNumber(result.evidenceAssessment.commentCount)}`,
          `- ${t.commentTextVolume}: ${formatNumber(result.evidenceAssessment.commentCharCount)}`
        ]
      : []),
    ...(result.performanceAssessment.dataWarnings.length > 0
      ? [
          "",
          `### ${t.dataWarnings}`,
          ...result.performanceAssessment.dataWarnings.map((warning) => `- ${warning}`)
        ]
      : []),
    "",
    `## ${t.keyTakeaways}`,
    ...result.summary.keyTakeaways.map((item) => `- ${item}`),
    "",
    `## ${t.reusableFactors}`,
    ...result.whyItWorked.reusableFactors.map((item) => `- ${item}`),
    "",
    `## ${t.nextContentSuggestions}`,
    ...result.nextContentSuggestions.contentDirections.flatMap((item) => [
      `- ${item.direction}`,
      `  ${item.why_this_direction}`
    ]),
    "",
    `## ${t.rawQuotes}`,
    ...formatLanguageGroupsForBrief(result.userLanguageLibrary.rawQuoteGroups),
    "",
    `## ${t.benefitPhrases}`,
    ...formatLanguageGroupsForBrief(result.userLanguageLibrary.painPointExpressionGroups),
    "",
    `## ${t.seoPhrases}`,
    ...formatLanguageGroupsForBrief(result.userLanguageLibrary.seoPhraseGroups),
    "",
    `## ${t.groupActions}`,
    ...result.nextContentSuggestions.doMore.map((item) => `- ${t.reusablePrefix}: ${item}`),
    ...result.nextContentSuggestions.avoid.map((item) => `- ${t.watchoutPrefix}: ${item}`)
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function isDetailedAnalysisSkipped(result: ReturnType<typeof normalizeAnalysisResult>) {
  return (
    result.performanceAssessment.level === "low" ||
    result.performanceAssessment.level === "insufficient_data" ||
    result.evidenceAssessment.mode === "insufficient_evidence"
  );
}

function formatPerformanceReason(
  result: ReturnType<typeof normalizeAnalysisResult>,
  t: ReturnType<typeof getMessages>
) {
  if (result.performanceAssessment.level === "high") {
    return t.performanceReasonHigh;
  }

  if (result.performanceAssessment.level === "medium") {
    return t.performanceReasonMedium;
  }

  if (result.performanceAssessment.level === "low") {
    return t.performanceReasonLow;
  }

  return t.performanceReasonInsufficient;
}

function getReplicationDecision(
  result: ReturnType<typeof normalizeAnalysisResult>,
  t: ReturnType<typeof getMessages>
) {
  if (result.evidenceAssessment.mode === "insufficient_evidence") {
    return {
      label: t.insufficientData,
      title: t.replicationDecisionEvidenceInsufficient,
      className: "bg-ember/15 text-ember"
    };
  }

  if (result.performanceAssessment.level === "high") {
    return {
      label: t.recommended,
      title: t.replicationDecisionHigh,
      className: "bg-leaf text-moss"
    };
  }

  if (result.performanceAssessment.level === "medium") {
    return {
      label: t.reviewFirst,
      title: t.replicationDecisionMedium,
      className: "bg-sand text-moss"
    };
  }

  if (result.performanceAssessment.level === "low") {
    return {
      label: t.notRecommended,
      title: t.replicationDecisionLow,
      className: "bg-ember/15 text-ember"
    };
  }

  return {
    label: t.insufficientData,
    title: t.replicationDecisionInsufficient,
    className: "bg-ember/15 text-ember"
  };
}

function buildScreeningSummary(
  result: ReturnType<typeof normalizeAnalysisResult>,
  t: ReturnType<typeof getMessages>
) {
  if (result.evidenceAssessment.mode === "insufficient_evidence") {
    return {
      title: t.screeningEvidenceTitle,
      body: t.screeningEvidenceBody
    };
  }

  const isInsufficientData = result.performanceAssessment.level === "insufficient_data";

  return {
    title: isInsufficientData ? t.screeningInsufficientTitle : t.screeningLowTitle,
    body: isInsufficientData ? t.screeningInsufficientBody : t.screeningLowBody
  };
}

function getEvidenceModeDisplay(
  result: ReturnType<typeof normalizeAnalysisResult>,
  t: ReturnType<typeof getMessages>
) {
  if (result.evidenceAssessment.mode === "full_text_analysis") {
    return {
      label: t.evidenceFullLabel,
      title: t.evidenceFullTitle,
      body: t.evidenceFullBody,
      className: "bg-leaf text-moss"
    };
  }

  if (result.evidenceAssessment.mode === "comment_language_analysis") {
    return {
      label: t.evidenceCommentLabel,
      title: t.evidenceCommentTitle,
      body: t.evidenceCommentBody,
      className: "bg-sand text-moss"
    };
  }

  if (result.evidenceAssessment.mode === "content_text_analysis") {
    return {
      label: t.evidenceContentLabel,
      title: t.evidenceContentTitle,
      body: t.evidenceContentBody,
      className: "bg-sand text-moss"
    };
  }

  return {
    label: t.evidenceInsufficientLabel,
    title: t.evidenceInsufficientTitle,
    body: t.evidenceInsufficientBody,
    className: "bg-ember/15 text-ember"
  };
}

function formatLanguageGroupsForBrief(
  groups: Array<{
    sellingPoint: string;
    phrases: string[];
  }>
) {
  return groups.flatMap((group) => [
    `### ${group.sellingPoint}`,
    ...group.phrases.map((phrase) => `- ${normalizeDisplayText(phrase)}`)
  ]);
}

function formatLanguageGroupForCopy(group: { sellingPoint: string; phrases: string[] }) {
  return [
    group.sellingPoint,
    ...group.phrases.map((phrase) => `- ${normalizeDisplayText(phrase)}`)
  ].join("\n");
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "analysis"
  );
}
