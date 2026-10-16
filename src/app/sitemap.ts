import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { productRepository } from "@/lib/catalog";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await productRepository.list();
  const paths = ["", "/collection", "/story", ...products.map((p) => `/product/${p.slug}`)];

  return paths.map((path) => ({
    url: new URL(`/mn${path}`, siteUrl).toString(),
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, new URL(`/${l}${path}`, siteUrl).toString()]),
      ),
    },
  }));
}
