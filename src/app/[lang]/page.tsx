import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const meta = pageMetadata({
    locale,
    path: "",
    title: dict.meta.title,
    description: dict.meta.description,
  });
  return { ...meta, title: { absolute: dict.meta.title } };
}

// Placeholder. Scroll түүх (Phase 2–3) энэ хуудсыг орлоно.
export default async function Home() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="text-eyebrow text-camel-deep">{dict.home.eyebrow}</p>
      <h1 className="mt-8 max-w-4xl text-display">{dict.home.title}</h1>
      <p className="mt-8 max-w-md text-ink-soft">{dict.home.lead}</p>
      <ButtonLink href={`/${locale}/collection`} variant="secondary" size="lg" className="mt-14">
        {dict.home.cta}
      </ButtonLink>
    </main>
  );
}
