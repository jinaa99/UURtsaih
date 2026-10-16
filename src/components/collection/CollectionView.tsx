import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import type { Category, Colorway, Product } from "@/lib/catalog/types";

export type CollectionFilters = { category: Category | null; color: string | null };

/**
 * Шүүлтүүр + grid. Шүүлтүүр нь URL query (?category=&color=) тул холбоосоор
 * хуваалцах боломжтой, JavaScript-гүйгээр ч ажиллана.
 */
export function CollectionView({
  products,
  categories,
  colors,
  filters,
  locale,
  dict,
}: {
  products: readonly Product[];
  categories: readonly Category[];
  colors: readonly Colorway[];
  filters: CollectionFilters;
  locale: Locale;
  dict: Dictionary;
}) {
  const visible = products.filter(
    (p) =>
      (!filters.category || p.category === filters.category) &&
      (!filters.color || p.colors.some((c) => c.id === filters.color)),
  );

  const hrefWith = (next: Partial<CollectionFilters>) => {
    const merged = { ...filters, ...next };
    const qs = new URLSearchParams();
    if (merged.category) qs.set("category", merged.category);
    if (merged.color) qs.set("color", merged.color);
    const s = qs.toString();
    return `/${locale}/collection${s ? `?${s}` : ""}`;
  };

  const chip =
    "shrink-0 border px-4 py-2 text-eyebrow transition-colors duration-(--duration-slow) ease-silk";
  const chipState = (active: boolean) =>
    active ? "border-ink bg-ink text-cream" : "border-mist-light hover:border-ink";

  return (
    <>
      <div className="space-y-6 border-y border-mist-light py-6">
        <nav aria-label={dict.collection.filterCategory} className="flex items-center gap-6">
          <span className="hidden w-16 shrink-0 text-eyebrow text-ink-soft sm:block">
            {dict.collection.filterCategory}
          </span>
          <ul className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            {[null, ...categories].map((c) => (
              <li key={c ?? "all"}>
                <Link
                  href={hrefWith({ category: c })}
                  scroll={false}
                  aria-current={filters.category === c ? "true" : undefined}
                  className={`${chip} ${chipState(filters.category === c)} block`}
                >
                  {c ? dict.categories[c] : dict.categories.all}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.collection.filterColor} className="flex items-center gap-6">
          <span className="hidden w-16 shrink-0 text-eyebrow text-ink-soft sm:block">
            {dict.collection.filterColor}
          </span>
          <ul className="flex flex-wrap items-center gap-3">
            <li>
              <Link
                href={hrefWith({ color: null })}
                scroll={false}
                aria-current={!filters.color ? "true" : undefined}
                className={`text-eyebrow underline-offset-8 ${!filters.color ? "underline" : "text-ink-soft hover:text-ink"}`}
              >
                {dict.collection.allColors}
              </Link>
            </li>
            {colors.map((c) => {
              const active = filters.color === c.id;
              return (
                <li key={c.id}>
                  <Link
                    href={hrefWith({ color: active ? null : c.id })}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    aria-label={c.name[locale]}
                    title={c.name[locale]}
                    className={`block size-7 rounded-full ring-offset-2 ring-offset-cream transition-shadow ${active ? "ring-1 ring-ink" : "ring-1 ring-ink/10 hover:ring-ink/40"}`}
                    style={{ backgroundColor: c.swatch }}
                  />
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <p className="mt-6 mb-10 text-xs text-ink-soft" aria-live="polite">
        {fill(dict.collection.count, { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl">{dict.collection.empty}</p>
          <Link
            href={`/${locale}/collection`}
            className="mt-6 inline-block text-eyebrow underline underline-offset-8"
          >
            {dict.collection.reset}
          </Link>
        </div>
      ) : (
        <ul className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <li key={p.id}>
              <ProductCard
                product={p}
                locale={locale}
                imageLabel={dict.product.imagePlaceholder}
                priority={i < 2}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
