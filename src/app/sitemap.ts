import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { productRepository } from "@/lib/catalog";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await productRepository.list();
  const paths = [
    "",
    "/collection",
    "/story",
    "/credits",
    ...products.map((p) => `/product/${p.slug}`),
  ];

  // Хэл бүрийн URL тус тусдаа мөр, тус бүр бусад хэлний alternate-тай (hreflang).
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      locales.map((l) => [l, new URL(`/${l}${path}`, siteUrl).toString()]),
    );
    return locales.map((l) => ({
      url: languages[l],
      changeFrequency: path.startsWith("/product") ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path.startsWith("/product") || path === "/collection" ? 0.8 : 0.5,
      alternates: { languages: { ...languages, "x-default": languages.mn } },
    }));
  });
}
