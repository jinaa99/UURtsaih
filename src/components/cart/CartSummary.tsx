"use client";

import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useI18n } from "@/components/i18n/I18nProvider";
import { formatPrice } from "@/lib/currency";
import { subtotal } from "@/lib/cart/store";
import { useCart } from "./CartProvider";

export function CartSubtotal() {
  const { dict } = useI18n();
  const { currency } = useCurrency();
  const { lines } = useCart();
  const amount = subtotal(lines, currency);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-eyebrow">{dict.cart.subtotal}</span>
        <span className="text-lg tabular-nums">
          {formatPrice({ MNT: amount, USD: amount }, currency)}
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-soft">{dict.cart.shippingNote}</p>
    </div>
  );
}
