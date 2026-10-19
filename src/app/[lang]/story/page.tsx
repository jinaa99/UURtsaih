import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ProcessSteps, type StepId } from "@/components/story/ProcessSteps";
import { StoryMap, type JourneyStop } from "@/components/story/StoryMap";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { coverSizes, getPhoto, type PhotoAsset, type PhotoId } from "@/lib/media";
import { ogImages, pageMetadata } from "@/lib/seo";

const heroPhoto = getPhoto("hero-unsplash-svaofknuoak");
const closingPhoto = getPhoto("fabric-bg-unsplash-7bzir1wr8x8");

/** Өргөн parallax зургууд (dictionary-ийн `story.quotes` түлхүүрээр). */
const widePhotos: Record<string, PhotoId> = {
  steppe: "landscape-unsplash-a1feqo3u3hg",
  herders: "herd-unsplash-r3ybyb4nyni",
  dawn: "landscape-unsplash-7fprfl6viu8",
};

/**
 * Тоо баримт — **зохиож бичихгүй**. Брэнд баталгаажуулсан тоог энд тавина;
 * `null` бол "Удахгүй" placeholder харагдана.
 */
const facts: Record<"micron" | "herders" | "yield" | "distance", number | null> = {
  micron: null,
  herders: null,
  yield: null,
  distance: null,
};

const stepIds: StepId[] = ["comb", "clean", "spin", "knit"];
const stopIds: JourneyStop["id"][] = ["gobi", "mid", "factory"];

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({
    locale,
    path: "/story",
    title: dict.story.title,
    description: dict.story.description,
    image: ogImages.story,
  });
}

/** Бүтэн өргөнтэй, parallax-тай тал нутгийн зураг + нэг мөр. */
function WidePhoto({ photo, alt, quote }: { photo: PhotoAsset; alt: string; quote: string }) {
  return (
    <figure className="relative isolate h-[78svh] min-h-[28rem] overflow-hidden">
      <div data-parallax="0.12" className="absolute inset-x-0 -inset-y-[12%] -z-10">
        <Image
          src={photo.files["2400"]}
          alt={alt}
          fill
          sizes={coverSizes(photo, 97)}
          className="object-cover"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(43_39_35/0)_35%,rgb(43_39_35/0.62)_100%)]"
      />
      <figcaption className="absolute inset-x-0 bottom-0 px-5 pb-12 sm:px-10 sm:pb-16">
        <Reveal
          as="p"
          className="mx-auto max-w-screen-2xl text-title text-cream [text-shadow:0_1px_24px_rgb(43_39_35/0.45)]"
        >
          {quote}
        </Reveal>
      </figcaption>
    </figure>
  );
}

// Говь → тал → үйлдвэр (газрын зураг), самнах → нэхэх, тал нутгийн parallax, тоо баримт (placeholder).
export default async function StoryPage() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.story;
  const stops = stopIds.map((id) => ({ id, ...t.map.stops[id] }));
  const steps = stepIds.map((id) => ({ id, ...t.process.steps[id] }));
  const photo = (key: keyof typeof t.quotes) => getPhoto(widePhotos[key]);

  return (
    <main>
      <SmoothScroll />

      <section className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pt-24 text-center">
        <div data-parallax="0.1" className="absolute inset-x-0 -inset-y-[10%] -z-20">
          <Image
            src={heroPhoto.files["2400"]}
            alt={heroPhoto.alt[locale]}
            fill
            loading="eager"
            // LCP нь гарчиг (текст) — фон зураг фонт/CSS-тэй өрсөлдөхгүй.
            fetchPriority="low"
            sizes={coverSizes(heroPhoto, 120)}
            className="object-cover"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(246_241_232/0.5)_0%,rgb(246_241_232/0.2)_50%,rgb(246_241_232/0.85)_100%)]"
        />
        {/* Текстийн ард зөөлөн цөцгий туяа — хад чулуун дээр ч уншигдана. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_42%_at_50%_52%,rgb(246_241_232/0.78)_0%,rgb(246_241_232/0)_100%)]"
        />
        <p className="text-eyebrow text-ink">{t.eyebrow}</p>
        {/* LCP — JS reveal-гүй, шууд харагдана. */}
        <h1 className="mt-6 text-display">{t.headline}</h1>
        <p
          data-reveal-fade
          className="mt-8 max-w-lg text-lead text-ink-soft"
          style={{ "--reveal-delay": "300ms" } as CSSProperties}
        >
          {t.lead}
        </p>
      </section>

      <p
        data-reveal-fade
        className="mx-auto mt-28 max-w-2xl px-5 text-center font-serif text-2xl leading-snug text-ink sm:mt-40 sm:text-3xl"
      >
        {t.intro}
      </p>

      {/* 1. Газрын зураг: говиос үйлдвэр хүртэл гэрлийн шугам. */}
      <section aria-label={t.map.label} className="mt-16 sm:mt-24">
        <StoryMap stops={stops} label={t.map.label} />
      </section>

      <WidePhoto
        photo={photo("steppe")}
        alt={photo("steppe").alt[locale]}
        quote={t.quotes.steppe}
      />

      {/* 2. Ноолуур хэрхэн бий болдог. */}
      <section
        aria-labelledby="story-process"
        className="mx-auto max-w-screen-2xl px-5 py-28 sm:px-10 sm:py-40"
      >
        <p data-reveal-fade className="text-eyebrow text-camel-deep">
          {t.process.eyebrow}
        </p>
        <Reveal as="h2" id="story-process" className="mt-6 text-title" delay={120}>
          {t.process.title}
        </Reveal>
        <div className="mt-16 sm:mt-24">
          <ProcessSteps steps={steps} />
        </div>
      </section>

      <WidePhoto
        photo={photo("herders")}
        alt={photo("herders").alt[locale]}
        quote={t.quotes.herders}
      />

      {/* 4. Тоо баримт — баталгаажаагүй тул placeholder. */}
      <section
        aria-labelledby="story-facts"
        className="mx-auto max-w-screen-2xl px-5 py-28 sm:px-10 sm:py-40"
      >
        <p data-reveal-fade className="text-eyebrow text-camel-deep">
          {t.facts.eyebrow}
        </p>
        <Reveal as="h2" id="story-facts" className="mt-6 text-title" delay={120}>
          {t.facts.title}
        </Reveal>
        <dl className="mt-16 grid gap-px overflow-hidden bg-mist-light sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(facts) as (keyof typeof facts)[]).map((key, i) => {
            const value = facts[key];
            const item = t.facts.items[key];
            return (
              <div
                key={key}
                data-reveal-fade
                className="flex flex-col-reverse justify-end gap-6 bg-cream p-8 sm:p-10"
                style={{ "--reveal-delay": `${i * 120}ms` } as CSSProperties}
              >
                <dt className="text-sm text-ink-soft">{item.label}</dt>
                <dd className="flex items-baseline gap-3">
                  <span
                    className={`font-serif text-6xl font-light tabular-nums ${value === null ? "text-ink-soft" : ""}`}
                  >
                    {value === null ? "—" : value.toLocaleString(locale)}
                  </span>
                  <span className="text-eyebrow text-ink-soft">{item.unit}</span>
                  {value === null && (
                    <span className="ml-auto text-eyebrow text-camel-deep">{t.facts.pending}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
        <p className="mt-6 text-xs text-ink-soft">{t.facts.note}</p>
      </section>

      <WidePhoto photo={photo("dawn")} alt={photo("dawn").alt[locale]} quote={t.quotes.dawn} />

      <section className="relative isolate flex min-h-[60svh] items-center justify-center overflow-hidden px-5">
        <div data-parallax="0.08" className="absolute inset-x-0 -inset-y-[8%] -z-10">
          <Image
            src={closingPhoto.files["2400"]}
            alt=""
            fill
            sizes={coverSizes(closingPhoto, 70)}
            className="object-cover opacity-80"
          />
        </div>
        <ButtonLink href={`/${locale}/collection`} size="lg">
          {dict.home.cta}
        </ButtonLink>
      </section>
    </main>
  );
}
