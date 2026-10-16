/**
 * PLACEHOLDER БҮТЭЭГДЭХҮҮН.
 *
 * Нэр, үнэ, өнгө, хэмжээ нь бүтцийг турших зориулалттай түр утга.
 * Найрлага, жин, гарал үүсэл, сэтгэгдэл зэрэг баримтыг ЗОХИОЖ БИЧИХГҮЙ —
 * брэнд бодит мэдээлэл өгөхөд энд солино. Зургийн `src: null` нь
 * placeholder харуулна (Phase 2-т бөглөнө).
 *
 * Энэ файлыг зөвхөн `src/lib/catalog/local-repository.ts` импортлоно.
 */
import type { Colorway, ImageSlot, LocalizedText, Product } from "@/lib/catalog/types";
import { ONE_SIZE } from "@/lib/catalog/types";

const color = {
  cream: { id: "cream", name: { mn: "Цөцгий", en: "Cream" }, swatch: "#EDE3D1" },
  sand: { id: "sand", name: { mn: "Элс", en: "Sand" }, swatch: "#D9C7A7" },
  camel: { id: "camel", name: { mn: "Тэмээн хүрэн", en: "Camel" }, swatch: "#B08A5F" },
  mist: { id: "mist", name: { mn: "Манан саарал", en: "Mist grey" }, swatch: "#B9B6B0" },
  charcoal: { id: "charcoal", name: { mn: "Нүүрс", en: "Charcoal" }, swatch: "#4A4541" },
} satisfies Record<string, Colorway>;

const apparelSizes = ["XS", "S", "M", "L", "XL"] as const;

const placeholderDescription: LocalizedText = {
  mn: "Бүтээгдэхүүний тайлбар удахгүй нэмэгдэнэ.",
  en: "Product description coming soon.",
};

/** Зургийн хоосон слотууд (3:4 харьцаа). */
function imageSlots(name: LocalizedText, count: number): ImageSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    src: null,
    alt: { mn: `${name.mn} — зураг ${i + 1}`, en: `${name.en} — image ${i + 1}` },
    width: 1200,
    height: 1600,
  }));
}

function product(p: Omit<Product, "description" | "images"> & { imageCount: number }): Product {
  const { imageCount, ...rest } = p;
  return { ...rest, description: placeholderDescription, images: imageSlots(p.name, imageCount) };
}

export const products: readonly Product[] = [
  product({
    id: "p-sweater-01",
    slug: "dawn-sweater",
    category: "sweater",
    name: { mn: "Үүр цамц", en: "Dawn Sweater" },
    price: { MNT: 890_000, USD: 259 },
    colors: [color.cream, color.camel, color.mist],
    sizes: apparelSizes,
    imageCount: 4,
  }),
  product({
    id: "p-cardigan-01",
    slug: "steppe-cardigan",
    category: "cardigan",
    name: { mn: "Тал кардиган", en: "Steppe Cardigan" },
    price: { MNT: 1_190_000, USD: 349 },
    colors: [color.sand, color.charcoal],
    sizes: apparelSizes,
    imageCount: 4,
  }),
  product({
    id: "p-scarf-01",
    slug: "wind-scarf",
    category: "scarf",
    name: { mn: "Салхи ороолт", en: "Wind Scarf" },
    price: { MNT: 490_000, USD: 149 },
    colors: [color.cream, color.camel, color.mist, color.charcoal],
    sizes: [ONE_SIZE],
    imageCount: 3,
  }),
  product({
    id: "p-hat-01",
    slug: "ridge-beanie",
    category: "hat",
    name: { mn: "Нуруу малгай", en: "Ridge Beanie" },
    price: { MNT: 290_000, USD: 89 },
    colors: [color.camel, color.mist, color.charcoal],
    sizes: [ONE_SIZE],
    imageCount: 3,
  }),
  product({
    id: "p-gloves-01",
    slug: "ember-gloves",
    category: "gloves",
    name: { mn: "Цог бээлий", en: "Ember Gloves" },
    price: { MNT: 250_000, USD: 79 },
    colors: [color.sand, color.charcoal],
    sizes: ["S", "M", "L"],
    imageCount: 3,
  }),
  product({
    id: "p-wrap-01",
    slug: "gobi-wrap",
    category: "wrap",
    name: { mn: "Говь нөмрөг", en: "Gobi Wrap" },
    price: { MNT: 1_490_000, USD: 429 },
    colors: [color.cream, color.sand, color.mist],
    sizes: [ONE_SIZE],
    imageCount: 4,
  }),
];
