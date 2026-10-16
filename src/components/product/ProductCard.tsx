import Link from "next/link";
import { PriceTag } from "@/components/currency/PriceTag";
import type { Product } from "@/lib/catalog/types";
import type { Locale } from "@/i18n/config";
import { ProductImage } from "./ProductImage";

export function ProductCard({
  product,
  locale,
  imageLabel,
  priority = false,
}: {
  product: Product;
  locale: Locale;
  imageLabel: string;
  priority?: boolean;
}) {
  const [first, second] = product.images;
  const tint = product.colors[0].swatch;

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden">
        <ProductImage
          slot={first}
          locale={locale}
          tint={tint}
          label={imageLabel}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
        />
        {second?.src && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-(--duration-slow) ease-silk group-hover:opacity-100">
            <ProductImage
              slot={second}
              locale={locale}
              tint={tint}
              label={imageLabel}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl leading-tight">{product.name[locale]}</h3>
          <ul
            className="mt-3 flex gap-1.5"
            aria-label={product.colors.map((c) => c.name[locale]).join(", ")}
          >
            {product.colors.map((c) => (
              <li
                key={c.id}
                className="size-2.5 rounded-full ring-1 ring-ink/10"
                style={{ backgroundColor: c.swatch }}
              />
            ))}
          </ul>
        </div>
        <PriceTag price={product.price} className="shrink-0 text-sm text-ink-soft" />
      </div>
    </Link>
  );
}
