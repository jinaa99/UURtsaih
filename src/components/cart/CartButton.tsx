"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { dict } = useI18n();
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      className="cursor-pointer text-eyebrow transition-colors hover:text-ink-soft"
    >
      {dict.nav.cart}
      <span className="ml-1.5 tabular-nums">({count})</span>
    </button>
  );
}
