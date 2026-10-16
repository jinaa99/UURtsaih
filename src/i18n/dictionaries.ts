import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import type mn from "./dictionaries/mn.json";

// mn.json нь эх загвар; en.json ижил бүтэцтэй байх ёстой.
export type Dictionary = typeof mn;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  mn: () => import("./dictionaries/mn.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
