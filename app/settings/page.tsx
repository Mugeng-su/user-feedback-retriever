import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SettingsForm } from "@/components/settings-form";
import { getMessages } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const settings = await getSettings();
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasYouTubeKey = Boolean(process.env.YOUTUBE_API_KEY);
  const t = getMessages(settings.locale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-8 lg:px-10">
      <div className="flex items-center justify-between gap-3">
        <Link className="text-sm text-moss/80 hover:text-moss" href="/">
          {t.backToWorkspace}
        </Link>
        <LanguageSwitcher locale={settings.locale} />
      </div>
      <SettingsForm
        hasGeminiKey={hasGeminiKey}
        hasOpenAIKey={hasOpenAIKey}
        hasYouTubeKey={hasYouTubeKey}
        settings={settings}
        locale={settings.locale}
      />
    </main>
  );
}
