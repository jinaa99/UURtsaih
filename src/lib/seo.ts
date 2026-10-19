import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

/** `path` нь locale-гүй зам ("" | "/collection" | "/product/x"). */
export function localizedAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}

/** Брэндийн OG зураг (scripts/media/build-og.mjs). */
export const ogImages = {
  default: { url: "/og/default.jpg", width: 1200, height: 630 },
  story: { url: "/og/story.jpg", width: 1200, height: 630 },
} as const;

export function pageMetadata({
  locale,
  path,
  title,
  description,
  image = ogImages.default,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Байхгүй бол брэндийн default OG зураг. */
  image?: { url: string; width: number; height: number; alt?: string };
}): Metadata {
  return {
    title,
    description,
    alternates: localizedAlternates(locale, path),
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      siteName: "ÜÜR",
      locale: locale === "mn" ? "mn_MN" : "en_US",
      type: "website",
      images: [{ alt: title, ...image }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

/** JSON-LD-г <script> дотор аюулгүй оруулна. */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
