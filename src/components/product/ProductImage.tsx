import Image from "next/image";
import type { ImageSlot } from "@/lib/catalog/types";
import type { Locale } from "@/i18n/config";

/**
 * Бүтээгдэхүүний зураг. `slot.src` хоосон бол өнгөний аястай placeholder.
 * Эцэг element нь `relative` бөгөөд хэмжээтэй (aspect-ratio) байх ёстой.
 */
export function ProductImage({
  slot,
  locale,
  tint,
  label,
  sizes,
  preload = false,
}: {
  slot: ImageSlot;
  locale: Locale;
  tint: string;
  label: string;
  sizes: string;
  /** LCP зураг: `<head>`-д preload (Next 16 — `priority`-ийн оронд). */
  preload?: boolean;
}) {
  if (slot.src) {
    return (
      <Image
        src={slot.src}
        alt={slot.alt[locale]}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={slot.alt[locale]}
      className="absolute inset-0 flex items-end justify-center pb-6"
      style={{
        backgroundColor: "var(--color-cream-deep)",
        backgroundImage: `radial-gradient(120% 90% at 50% 35%, ${tint}55 0%, ${tint}22 45%, transparent 75%)`,
      }}
    >
      <span className="text-eyebrow text-ink-soft/70">{label}</span>
    </div>
  );
}
