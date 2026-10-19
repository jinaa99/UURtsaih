import type { Locale } from "@/i18n/config";
import type { Product } from "@/lib/catalog/types";
import { ProductImage } from "./ProductImage";

/**
 * Утсан дээр: хэвтээ гүйдэг (scroll-snap) gallery.
 * Desktop дээр: зургууд босоо дараалан, мэдээлэл баруун талд sticky.
 */
export function ProductGallery({
  product,
  locale,
  label,
  imageLabel,
}: {
  product: Product;
  locale: Locale;
  label: string;
  imageLabel: string;
}) {
  const tint = product.colors[0].swatch;

  return (
    <section aria-label={label} className="relative min-w-0">
      <ul className="-mx-5 flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto sm:-mx-10 md:mx-0 md:grid md:grid-cols-2 md:gap-2 md:overflow-visible">
        {product.images.map((slot, i) => (
          <li
            key={i}
            className={`relative aspect-3/4 w-[88vw] shrink-0 snap-center first:ml-5 last:mr-5 sm:first:ml-10 md:w-auto md:first:ml-0 md:last:mr-0 ${i === 0 ? "md:col-span-2" : ""}`}
          >
            <ProductImage
              slot={slot}
              locale={locale}
              tint={tint}
              label={imageLabel}
              sizes={i === 0 ? "(min-width: 768px) 55vw, 88vw" : "(min-width: 768px) 28vw, 88vw"}
              preload={i === 0}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
