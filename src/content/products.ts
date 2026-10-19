/**
 * PLACEHOLDER БҮТЭЭГДЭХҮҮН.
 *
 * Нэр, үнэ, өнгө, хэмжээ нь бүтцийг турших зориулалттай түр утга.
 * Найрлага, жин, гарал үүсэл, сэтгэгдэл зэрэг баримтыг ЗОХИОЖ БИЧИХГҮЙ —
 * брэнд бодит мэдээлэл өгөхөд энд солино.
 *
 * ЗУРАГ: `photos` нь Unsplash-ийн ТҮР зураг (media.ts-д `placeholder: true`) —
 * бодит бүтээгдэхүүний зургаар солигдоно. Үлдсэн слот нь өнгөт placeholder.
 *
 * Энэ файлыг зөвхөн `src/lib/catalog/local-repository.ts` импортлоно.
 */
import type { Colorway, ImageSlot, LocalizedText, Product } from "@/lib/catalog/types";
import { ONE_SIZE } from "@/lib/catalog/types";
import { photoSlot, type PhotoId } from "@/lib/media";

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

/** Түр зургууд эхэнд, дараа нь хоосон слот (3:4) — нийт `imageCount`. */
function imageSlots(name: LocalizedText, count: number, photos: readonly PhotoId[]): ImageSlot[] {
  return Array.from({ length: Math.max(count, photos.length) }, (_, i) =>
    photos[i]
      ? photoSlot(photos[i])
      : {
          src: null,
          alt: { mn: `${name.mn} — зураг ${i + 1}`, en: `${name.en} — image ${i + 1}` },
          width: 1200,
          height: 1600,
        },
  );
}

function product(
  p: Omit<Product, "description" | "images"> & { imageCount: number; photos?: PhotoId[] },
): Product {
  const { imageCount, photos = [], ...rest } = p;
  return {
    ...rest,
    description: placeholderDescription,
    images: imageSlots(p.name, imageCount, photos),
  };
}

export const products: readonly Product[] = [
  product({
    id: "p-sweater-01",
    slug: "dawn-sweater",
    photos: [
      "product-placeholder-unsplash-xerawp_zrgu",
      "product-placeholder-unsplash-ed8ztaw49rg",
    ],
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
    photos: [
      "product-placeholder-unsplash-ed8ztaw49rg",
      "product-placeholder-unsplash-xerawp_zrgu",
    ],
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
    photos: [
      "product-placeholder-unsplash-nlnimoqmbpg",
      "product-placeholder-unsplash-rgead36yygi",
    ],
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
    photos: ["product-placeholder-unsplash-wwpjvindatc"],
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
    photos: [
      "product-placeholder-unsplash-zhpcd4y-svg",
      "product-placeholder-unsplash-rgead36yygi",
    ],
    category: "wrap",
    name: { mn: "Говь нөмрөг", en: "Gobi Wrap" },
    price: { MNT: 1_490_000, USD: 429 },
    colors: [color.cream, color.sand, color.mist],
    sizes: [ONE_SIZE],
    imageCount: 4,
  }),
];
