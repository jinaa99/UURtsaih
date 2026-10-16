import type { Locale } from "@/i18n/config";
import type { Price } from "@/lib/currency";

/** Хэл бүрт заавал утгатай текст. */
export type LocalizedText = Readonly<Record<Locale, string>>;

export const categories = ["sweater", "cardigan", "scarf", "hat", "gloves", "wrap"] as const;
export type Category = (typeof categories)[number];

export type Colorway = {
  /** URL болон сагсанд ашиглах тогтвортой түлхүүр. */
  id: string;
  name: LocalizedText;
  /** Өнгөний дугуй болон зургийн placeholder-ын өнгө. */
  swatch: string;
};

/**
 * Зургийн слот. `src` нь null бол placeholder харуулна.
 * Зураг нэмэхдээ CLAUDE.md-ийн зургийн дүрмийг баримтал.
 */
export type ImageSlot = {
  src: string | null;
  alt: LocalizedText;
  width: number;
  height: number;
};

export type Product = {
  id: string;
  slug: string;
  category: Category;
  name: LocalizedText;
  /** Placeholder — бодит тайлбарыг брэнд өгнө. */
  description: LocalizedText;
  price: Price;
  colors: readonly Colorway[];
  /** "one-size" нь хэмжээ сонгох шаардлагагүй гэсэн үг. */
  sizes: readonly string[];
  images: readonly ImageSlot[];
};

export const ONE_SIZE = "one-size";

export const localize = (text: LocalizedText, locale: Locale) => text[locale];
