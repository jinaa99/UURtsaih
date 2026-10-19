import type { Colorway, LocalizedText } from "@/lib/catalog/types";
import type { Currency, Price } from "@/lib/currency";

/**
 * Demo сагс — зөвхөн browser-ийн localStorage-д хадгална.
 * Мөр бүр харуулахад хэрэгтэй мэдээллийн хуулбарыг (нэр, үнэ) хадгална;
 * бодит checkout нээгдэхэд server талд productId-аар дахин шалгана.
 */
export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: LocalizedText;
  price: Price;
  color: Colorway;
  size: string;
  /** Жижиг зураг (байхгүй бол өнгөөр). Хуучин сагсанд байхгүй байж болно. */
  image?: string | null;
  quantity: number;
};

export const MAX_QUANTITY = 10;
const STORAGE_KEY = "uur:cart:v1";
const EMPTY: readonly CartLine[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedLines: readonly CartLine[] = EMPTY;

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): readonly CartLine[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as CartLine[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** useSyncExternalStore-д тогтвортой reference буцаана. */
export function getSnapshot(): readonly CartLine[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parse(raw);
  }
  return cachedLines;
}

export const getServerSnapshot = () => EMPTY;

export function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(lines: readonly CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage хаалттай үед сагс хадгалагдахгүй.
  }
  listeners.forEach((l) => l());
}

export const lineKey = (productId: string, colorId: string, size: string) =>
  `${productId}|${colorId}|${size}`;

export function addLine(line: Omit<CartLine, "key" | "quantity">, quantity = 1) {
  const key = lineKey(line.productId, line.color.id, line.size);
  const lines = getSnapshot();
  const existing = lines.find((l) => l.key === key);
  write(
    existing
      ? lines.map((l) =>
          l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) } : l,
        )
      : [...lines, { ...line, key, quantity: Math.min(MAX_QUANTITY, quantity) }],
  );
}

export function setQuantity(key: string, quantity: number) {
  if (quantity <= 0) return removeLine(key);
  write(
    getSnapshot().map((l) =>
      l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l,
    ),
  );
}

export function removeLine(key: string) {
  write(getSnapshot().filter((l) => l.key !== key));
}

export const countItems = (lines: readonly CartLine[]) =>
  lines.reduce((sum, l) => sum + l.quantity, 0);

export const subtotal = (lines: readonly CartLine[], currency: Currency): Price[Currency] =>
  lines.reduce((sum, l) => sum + l.price[currency] * l.quantity, 0);
