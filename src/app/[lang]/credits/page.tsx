import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { allPhotos } from "@/lib/media";
import { media } from "@/content/media";
import type { AudioAsset, MediaAsset, TextureAsset } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({
    locale,
    path: "/credits",
    title: dict.credits.title,
    description: dict.credits.description,
  });
}

const sourceName: Record<MediaAsset["source"], string> = {
  unsplash: "Unsplash",
  pexels: "Pexels",
  pixabay: "Pixabay",
  polyhaven: "Poly Haven",
  ambientcg: "ambientCG",
  freesound: "Freesound",
};

// Зохиогчийн нэр, эх сурвалж (Unsplash API guideline-ийн дагуу) — media.ts-ээс.
export default async function CreditsPage() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const photos = allPhotos();
  const textures = (media as readonly MediaAsset[]).filter(
    (a): a is TextureAsset => a.kind === "texture",
  );
  const sounds = (media as readonly MediaAsset[]).filter(
    (a): a is AudioAsset => a.kind === "audio",
  );
  const link = "underline decoration-mist-light underline-offset-4 hover:decoration-ink";

  return (
    <main className="mx-auto max-w-screen-xl px-5 pt-28 sm:px-10 sm:pt-40">
      <h1 className="text-title">{dict.credits.title}</h1>
      <p className="mt-6 max-w-2xl text-ink-soft">{dict.credits.intro}</p>

      <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p) => (
          <li key={p.id} className="flex gap-4">
            <div className="relative aspect-square w-20 shrink-0 overflow-hidden bg-sand">
              <Image
                src={p.files["1200"]}
                alt={p.alt[locale]}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="text-sm">
              <p>
                {dict.credits.by}{" "}
                <a href={p.authorUrl} className={link} target="_blank" rel="noreferrer">
                  {p.author}
                </a>{" "}
                {dict.credits.on}{" "}
                <a href={p.sourceUrl} className={link} target="_blank" rel="noreferrer">
                  {sourceName[p.source]}
                </a>
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                <a href={p.licenseUrl} className={link} target="_blank" rel="noreferrer">
                  {p.license}
                </a>
                {p.placeholder && (
                  <span className="ml-2 text-camel-deep">· {dict.credits.placeholder}</span>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {textures.length > 0 && (
        <ul className="mt-16 space-y-2 border-t border-mist-light pt-8 text-sm text-ink-soft">
          {textures.map((t) => (
            <li key={t.id}>
              <a href={t.sourceUrl} className={link} target="_blank" rel="noreferrer">
                {t.name}
              </a>{" "}
              — {t.author}, {sourceName[t.source]} ·{" "}
              <a href={t.licenseUrl} className={link} target="_blank" rel="noreferrer">
                {t.license}
              </a>
            </li>
          ))}
        </ul>
      )}

      {sounds.length > 0 && (
        <ul className="mt-8 space-y-2 border-t border-mist-light pt-8 text-sm text-ink-soft">
          {sounds.map((s) => (
            <li key={s.id}>
              <a href={s.sourceUrl} className={link} target="_blank" rel="noreferrer">
                {s.name}
              </a>{" "}
              — {s.author}, {sourceName[s.source]} ·{" "}
              <a href={s.licenseUrl} className={link} target="_blank" rel="noreferrer">
                {s.license}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
