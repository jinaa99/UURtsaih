import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PriceTag } from "@/components/currency/PriceTag";
import { FilmGrain } from "@/components/home/FilmGrain";
import { HorizontalScroller } from "@/components/home/HorizontalScroller";
import { Loader } from "@/components/home/Loader";
import { Reveal } from "@/components/motion/Reveal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { WindSound } from "@/components/home/WindSound";
import { ProductImage } from "@/components/product/ProductImage";
import { HeroScrollStage } from "@/components/three/HeroScrollStage";
import { CHAPTERS, type ChapterId } from "@/components/three/particles/stages";
import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { productRepository, type Colorway } from "@/lib/catalog";
import { coverSizes, getAudio, getPhoto, getTexture, type PhotoId } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

const hero = getPhoto("hero-unsplash-xgbugdiobvm");
const jersey = getTexture("tex-cotton-jersey");
const wind = getAudio("audio-wind-freesound-697217");
const storyMain = getPhoto("landscape-unsplash-a1feqo3u3hg");
const storyDetail = getPhoto("herd-unsplash-r3ybyb4nyni");
const knitTexture = getTexture("tex-fabric019");

/** 3D-гүй хувилбарт бүлэг бүрийн зураг (02 салхи → 05 даавуу). */
const chapterImages: Record<ChapterId, { src: string; alt?: PhotoId }> = {
  wind: {
    src: getPhoto("hero-unsplash-svaofknuoak").files["1200"],
    alt: "hero-unsplash-svaofknuoak",
  },
  thread: {
    src: getPhoto("fiber-macro-unsplash-azb3jxdzkqe").files["1200"],
    alt: "fiber-macro-unsplash-azb3jxdzkqe",
  },
  knit: { src: knitTexture.maps.diffuse["1024"] },
  cloth: {
    src: getPhoto("fabric-bg-unsplash-7bzir1wr8x8").files["1200"],
    alt: "fabric-bg-unsplash-7bzir1wr8x8",
  },
};

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

/**
 * Нүүр: 01 үүр → 02 салхи → 03 утас → 04 нэхмэл → 05 даавуу (HeroScrollStage, 3D)
 * → 06 цуглуулга (хэвтээ scroll) → 07 түүх → footer (layout).
 * Статик зураг нь 3D-гүй үеийн fallback.
 */
export default async function Home() {
  const [locale, dict, products] = await Promise.all([
    getLocale(),
    getDictionary(),
    productRepository.list(),
  ]);
  // Даавууны өнгө = бүтээгдэхүүнд бодитоор байгаа өнгөнүүд.
  const colors = new Map<string, Colorway>();
  products.forEach((p) => p.colors.forEach((c) => colors.set(c.id, c)));
  const swatches = [...colors.values()].map((c) => ({
    id: c.id,
    name: c.name[locale],
    hex: c.swatch,
  }));
  const hrefForColor = Object.fromEntries(
    swatches.map((s) => [s.id, `/${locale}/collection?color=${s.id}`]),
  );

  const chapters = (Object.keys(CHAPTERS) as ChapterId[]).map((id) => ({
    id,
    ...dict.home.chapters[id],
  }));
  const productLabel = dict.product.imagePlaceholder;

  return (
    <main>
      <Loader label={dict.home.loading} />
      <SmoothScroll />
      <FilmGrain />
      <WindSound src={wind.file} labels={dict.home.sound} />

      <HeroScrollStage
        src={hero.files["1200"]}
        focusY={0.6}
        clothMaps={{ normal: jersey.maps.normal["1024"], roughness: jersey.maps.roughness["1024"] }}
        swatches={swatches}
        defaultSwatch="camel"
        labels={{ color: dict.home.color, view: dict.home.viewColor }}
        hrefForColor={hrefForColor}
        chapters={chapters}
        fallback={
          // Reduced-motion / сул төхөөрөмж: 3D-ийн оронд зурагтай бүлгүүд.
          <section className="mx-auto mt-24 grid max-w-screen-2xl gap-x-10 gap-y-20 px-5 sm:mt-32 sm:px-10 md:grid-cols-2">
            {chapters.map((c, i) => {
              const img = chapterImages[c.id];
              return (
                <figure key={c.id} className={i % 2 ? "md:mt-32" : ""}>
                  <div className="relative aspect-4/5 overflow-hidden bg-sand">
                    <Image
                      src={img.src}
                      alt={img.alt ? getPhoto(img.alt).alt[locale] : ""}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-8">
                    <p data-reveal-fade className="text-eyebrow text-camel-deep">
                      {c.eyebrow}
                    </p>
                    <Reveal as="h2" className="mt-4 text-title" delay={120}>
                      {c.title}
                    </Reveal>
                  </figcaption>
                </figure>
              );
            })}
          </section>
        }
        background={
          <Image
            src={hero.files["2400"]}
            alt={hero.alt[locale]}
            fill
            loading="eager"
            // LCP нь гарчиг (текст); эхэнд loader дарсан байдаг тул фонт/CSS-ийг түрүүлүүлнэ.
            fetchPriority="low"
            sizes={coverSizes(hero)}
            className="object-cover object-[50%_60%]"
          />
        }
      >
        {/* Текст уншигдахуйц байлгах зөөлөн цөцгий бүрхүүл. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(246_241_232/0.55)_0%,rgb(246_241_232/0.25)_45%,rgb(246_241_232/0.7)_100%)]"
        />
        <p className="text-eyebrow text-camel-deep">{dict.home.eyebrow}</p>
        <h1 className="mt-8 max-w-4xl text-display">{dict.home.title}</h1>
        <ButtonLink href={`/${locale}/collection`} size="lg" className="mt-14">
          {dict.home.cta}
        </ButtonLink>
      </HeroScrollStage>

      {/* 06 — Цуглуулга: хэвтээ scroll, том зураг, hover-д зөөлөн zoom. */}
      <section id="collection" aria-labelledby="home-collection" className="pt-24 md:pt-0">
        <HorizontalScroller label={dict.home.collection.eyebrow}>
          <div className="flex w-[64vw] shrink-0 snap-start flex-col justify-end self-stretch pb-14 sm:w-[52vw] md:w-[28rem] md:pb-[8svh]">
            <p data-reveal-fade className="text-eyebrow text-camel-deep">
              {dict.home.collection.eyebrow}
            </p>
            <Reveal as="h2" id="home-collection" className="mt-6 text-title font-light" delay={120}>
              {dict.home.collection.title}
            </Reveal>
            <p
              data-reveal-fade
              className="mt-8 text-lead text-ink-soft"
              style={{ "--reveal-delay": "300ms" } as CSSProperties}
            >
              {dict.home.collection.lead}
            </p>
          </div>

          {products.map((p, i) => (
            <Link
              key={p.id}
              href={`/${locale}/product/${p.slug}`}
              className="group block w-[78vw] shrink-0 snap-start sm:w-[46vw] md:w-auto"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-cream-deep md:h-[64svh]">
                <div className="absolute inset-0 transition-transform duration-[2400ms] ease-silk group-hover:scale-[1.06] group-focus-visible:scale-[1.06]">
                  <ProductImage
                    slot={p.images[0]}
                    locale={locale}
                    tint={p.colors[0].swatch}
                    label={productLabel}
                    sizes="(min-width: 768px) 48svh, (min-width: 640px) 46vw, 78vw"
                  />
                </div>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-eyebrow text-ink-soft tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-2xl leading-tight">{p.name[locale]}</h3>
                </div>
                <PriceTag price={p.price} className="shrink-0 text-sm text-ink-soft" />
              </div>
            </Link>
          ))}

          <div className="flex w-[60vw] shrink-0 snap-start items-center justify-center self-stretch sm:w-[36vw] md:w-[22rem]">
            <ButtonLink href={`/${locale}/collection`} variant="secondary" size="lg">
              {dict.home.collection.all}
            </ButtonLink>
          </div>
        </HorizontalScroller>
      </section>

      {/* 07 — Брэндийн түүх, гарал үүсэл. */}
      <section
        aria-labelledby="home-story"
        className="mx-auto mt-32 grid max-w-screen-2xl items-center gap-14 px-5 sm:mt-48 sm:px-10 md:grid-cols-12 md:gap-10"
      >
        <div className="relative md:col-span-7">
          <div
            data-reveal-fade
            className="relative aspect-4/5 overflow-hidden bg-sand sm:aspect-5/4"
          >
            <Image
              src={storyMain.files["2400"]}
              alt={storyMain.alt[locale]}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
          <div
            data-reveal-fade
            className="absolute -right-2 -bottom-12 hidden aspect-3/4 w-[34%] overflow-hidden bg-sand ring-8 ring-cream md:block lg:-right-16"
            style={{ "--reveal-delay": "250ms" } as CSSProperties}
          >
            <Image
              src={storyDetail.files["1200"]}
              alt={storyDetail.alt[locale]}
              fill
              sizes="20vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="max-w-md md:col-span-4 md:col-start-9">
          <p data-reveal-fade className="text-eyebrow text-camel-deep">
            {dict.home.story.eyebrow}
          </p>
          <Reveal as="h2" id="home-story" className="mt-6 text-display" delay={120}>
            {dict.home.story.title}
          </Reveal>
          <p
            data-reveal-fade
            className="mt-8 text-lead text-ink-soft"
            style={{ "--reveal-delay": "300ms" } as CSSProperties}
          >
            {dict.home.story.lead}
          </p>
          <ButtonLink href={`/${locale}/story`} variant="quiet" className="mt-10">
            {dict.home.story.cta}
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
