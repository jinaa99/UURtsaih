import type { Locale } from "@/i18n/config";

export const currencies = ["MNT", "USD"] as const;

export type Currency = (typeof currencies)[number];

/**
 * Бүтээгдэхүүний үнэ. Ханшаар хөрвүүлэхгүй — хоёр валютыг хоёуланг нь
 * гараар, бөөрөнхий тоогоор тавина (жишээ нь { MNT: 890_000, USD: 259 }).
 * Аль нэгийг нь орхивол type алдаа өгнө.
 */
export type Price = Readonly<Record<Currency, number>>;

export const isCurrency = (value: unknown): value is Currency =>
  typeof value === "string" && (currencies as readonly string[]).includes(value);

export const defaultCurrencyFor = (locale: Locale): Currency => (locale === "mn" ? "MNT" : "USD");

const symbols: Record<Currency, string> = { MNT: "₮", USD: "$" };

/** ₮890,000 / $259 — бүхэл тоо, мянгатын таслалтай. */
export function formatPrice(price: Price, currency: Currency): string {
  const amount = Math.round(price[currency]).toLocaleString("en-US");
  return `${symbols[currency]}${amount}`;
}
