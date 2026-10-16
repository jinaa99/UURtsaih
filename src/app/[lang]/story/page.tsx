import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({
    locale,
    path: "/story",
    title: dict.story.title,
    description: dict.story.description,
  });
}

// Энгийн бүтэц. Текст, зураг нь placeholder; 3D-г дараа нэмнэ.
export default async function StoryPage() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const sections = Object.entries(dict.story.sections);

  return (
    <main>
      <section className="flex min-h-[80dvh] flex-col items-center justify-center px-5 pt-24 text-center">
        <p className="text-eyebrow text-camel-deep">{dict.story.eyebrow}</p>
        <h1 className="mt-6 text-display">{dict.story.headline}</h1>
      </section>

      <div className="mx-auto max-w-screen-xl space-y-28 px-5 sm:space-y-40 sm:px-10">
        {sections.map(([key, title], i) => (
          <section
            key={key}
            aria-labelledby={`story-${key}`}
            className="grid items-center gap-10 md:grid-cols-2 md:gap-20"
          >
            <div aria-hidden className={`aspect-4/5 bg-sand/60 ${i % 2 ? "md:order-2" : ""}`} />
            <div className="max-w-md">
              <p className="text-eyebrow text-ink-soft">0{i + 1}</p>
              <h2 id={`story-${key}`} className="mt-4 text-title">
                {title}
              </h2>
              <p className="mt-6 text-lead text-ink-soft">{dict.story.placeholder}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-32 text-center">
        <ButtonLink href={`/${locale}/collection`} variant="secondary" size="lg">
          {dict.home.cta}
        </ButtonLink>
      </div>
    </main>
  );
}
