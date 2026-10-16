import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PriceTag } from "@/components/currency/PriceTag";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { productRepository, type Product } from "@/lib/catalog";
import { currencies } from "@/lib/currency";
import { jsonLd, pageMetadata, siteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

export async function generateStaticParams() {
  const products = await productRepository.list();
  return products.map((p) => ({ slug: p.slug }));
}

async function load(params: PageProps<"/[lang]/product/[slug]">["params"]) {
  const { slug } = await params;
  const product = await productRepository.getBySlug(slug);
  if (!product) notFound();
  return product;
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const [locale, product] = await Promise.all([getLocale(), load(params)]);
  const meta = pageMetadata({
    locale,
    path: `/product/${product.slug}`,
    title: product.name[locale],
    description: product.description[locale],
  });
  const images = product.images.flatMap((i) => (i.src ? [{ url: i.src, alt: i.alt[locale] }] : []));
  return { ...meta, openGraph: { ...meta.openGraph, images } };
}

function productJsonLd(product: Product, locale: Locale, collectionTitle: string) {
  const url = new URL(`/${locale}/product/${product.slug}`, siteUrl).toString();
  const images = product.images.flatMap((i) => (i.src ? [new URL(i.src, siteUrl).toString()] : []));
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name[locale],
      description: product.description[locale],
      sku: product.id,
      url,
      brand: { "@type": "Brand", name: "ÜÜR" },
      color: product.colors.map((c) => c.name[locale]).join(", "),
      ...(images.length ? { image: images } : {}),
      // Нөөцийн мэдээлэл (availability) байхгүй тул зохиож тавихгүй.
      offers: currencies.map((currency) => ({
        "@type": "Offer",
        url,
        priceCurrency: currency,
        price: product.price[currency],
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: collectionTitle,
          item: new URL(`/${locale}/collection`, siteUrl).toString(),
        },
        { "@type": "ListItem", position: 2, name: product.name[locale], item: url },
      ],
    },
  ];
}

export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const [locale, dict, product] = await Promise.all([getLocale(), getDictionary(), load(params)]);

  const info = [
    { title: dict.product.details, body: dict.product.detailsPlaceholder },
    { title: dict.product.care, body: dict.product.carePlaceholder },
    { title: dict.product.shipping, body: dict.product.shippingPlaceholder },
  ];

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pt-20 pb-32 sm:px-10 sm:pt-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(productJsonLd(product, locale, dict.collection.title)),
        }}
      />

      <nav className="mb-6 hidden md:block">
        <Link href={`/${locale}/collection`} className="text-eyebrow text-ink-soft hover:text-ink">
          ← {dict.product.back}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-16 lg:gap-24">
        <ProductGallery
          product={product}
          locale={locale}
          label={dict.product.gallery}
          imageLabel={dict.product.imagePlaceholder}
        />

        <div className="md:sticky md:top-28 md:self-start md:pb-16">
          <p className="text-eyebrow text-camel-deep">{dict.categories[product.category]}</p>
          <h1 className="mt-4 text-title">{product.name[locale]}</h1>
          <PriceTag price={product.price} className="mt-4 block text-lg" />
          <p className="mt-8 max-w-md text-ink-soft">{product.description[locale]}</p>

          <div className="mt-10">
            <ProductPurchase product={product} />
          </div>

          <div className="mt-12 divide-y divide-mist-light border-y border-mist-light">
            {info.map((s) => (
              <details key={s.title} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-eyebrow [&::-webkit-details-marker]:hidden">
                  {s.title}
                  <span
                    aria-hidden
                    className="text-base transition-transform duration-(--duration-slow) ease-silk group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-6 text-sm text-ink-soft">{s.body}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
