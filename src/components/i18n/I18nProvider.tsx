"use client";

import { createContext, use } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type I18nValue = { locale: Locale; dict: Dictionary };

const I18nContext = createContext<I18nValue | null>(null);

/** Client component-уудад locale ба dictionary өгнө (server-ээс нэг удаа дамжуулна). */
export function I18nProvider({ children, ...value }: I18nValue & { children: React.ReactNode }) {
  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nValue {
  const ctx = use(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
