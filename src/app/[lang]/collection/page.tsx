import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CollectionFilterBar,
  CollectionGrid,
  type CollectionFilters,
} from "@/components/collection/CollectionView";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { categories as allCategories, productRepository, type Colorway } from "@/lib/catalog";
import type { Category, Product } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({
    locale,
    path: "/collection",
    title: dict.collection.title,
    description: dict.collection.description,
  });
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function facets(products: readonly Product[]) {
  const categories = allCategories.filter((c) => products.some((p) => p.category === c));
  const colors = new Map<string, Colorway>();
  products.forEach((p) => p.colors.forEach((c) => colors.set(c.id, c)));
  return { categories, colors: [...colors.values()] };
}

export default async function CollectionPage({ searchParams }: PageProps<"/[lang]/collection">) {
  const [locale, dict, products] = await Promise.all([
    getLocale(),
    getDictionary(),
    productRepository.list(),
  ]);
  const { categories, colors } = facets(products);
  const shared = { products, categories, colors, locale, dict };

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pt-28 sm:px-10 sm:pt-40">
      <h1 className="mb-10 text-title sm:mb-14">{dict.collection.title}</h1>
      {/* Static shell: шүүлтүүргүй мөр + бүтэн grid. Query-тэй үед зөвхөн шүүлтүүрийн мөр stream хийгдэнэ. */}
      <Suspense
        fallback={<CollectionFilterBar {...shared} filters={{ category: null, color: null }} />}
      >
        <FilteredCollection searchParams={searchParams} shared={shared} />
      </Suspense>
      <CollectionGrid products={products} locale={locale} dict={dict} />
    </main>
  );
}

async function FilteredCollection({
  searchParams,
  shared,
}: {
  searchParams: PageProps<"/[lang]/collection">["searchParams"];
  shared: Omit<React.ComponentProps<typeof CollectionFilterBar>, "filters">;
}) {
  const sp = await searchParams;
  const category = one(sp.category);
  const color = one(sp.color);
  const filters: CollectionFilters = {
    category: shared.categories.includes(category as Category) ? (category as Category) : null,
    color: shared.colors.some((c) => c.id === color) ? color! : null,
  };
  return <CollectionFilterBar {...shared} filters={filters} />;
}
