"use client";

import { formatPrice, type Price } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";

export function PriceTag({ price, className }: { price: Price; className?: string }) {
  const { currency } = useCurrency();
  return <span className={className}>{formatPrice(price, currency)}</span>;
}
