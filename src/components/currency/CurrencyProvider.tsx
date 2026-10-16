"use client";

import { createContext, use, useCallback, useSyncExternalStore } from "react";
import { isCurrency, type Currency } from "@/lib/currency";

const STORAGE_KEY = "uur:currency";
const listeners = new Set<() => void>();

function readStored(): Currency | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isCurrency(value) ? value : null;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Хэрэглэгчийн сонгосон валют. Сонгоогүй бол хэлнээс хамаарсан default
 * (mn → MNT, en → USD). Server render болон hydration үед default-ыг
 * ашиглах тул HTML зөрөхгүй.
 */
export function CurrencyProvider({
  defaultCurrency,
  children,
}: {
  defaultCurrency: Currency;
  children: React.ReactNode;
}) {
  const currency = useSyncExternalStore(
    subscribe,
    () => readStored() ?? defaultCurrency,
    () => defaultCurrency,
  );

  const setCurrency = useCallback((next: Currency) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode гэх мэт — сонголт энэ session-д л хадгалагдахгүй.
    }
    listeners.forEach((l) => l());
  }, []);

  return <CurrencyContext value={{ currency, setCurrency }}>{children}</CurrencyContext>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = use(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
