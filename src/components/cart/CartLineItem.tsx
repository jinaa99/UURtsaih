"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";
import { PriceTag } from "@/components/currency/PriceTag";
import { ONE_SIZE } from "@/lib/catalog/types";
import { MAX_QUANTITY, type CartLine } from "@/lib/cart/store";
import { useCart } from "./CartProvider";

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { locale, dict } = useI18n();
  const { setQuantity, remove } = useCart();
  const name = line.name[locale];

  return (
    <li className="flex gap-4 py-6">
      <Link
        href={`/${locale}/product/${line.slug}`}
        onClick={onNavigate}
        className="block aspect-3/4 w-20 shrink-0"
        style={{ backgroundColor: line.color.swatch }}
        aria-label={name}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/${locale}/product/${line.slug}`}
            onClick={onNavigate}
            className="font-serif text-lg leading-tight"
          >
            {name}
          </Link>
          <PriceTag
            price={{ MNT: line.price.MNT * line.quantity, USD: line.price.USD * line.quantity }}
            className="shrink-0 text-sm"
          />
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {line.color.name[locale]} · {line.size === ONE_SIZE ? dict.product.oneSize : line.size}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div
            role="group"
            aria-label={`${dict.cart.quantity}: ${name}`}
            className="flex items-center border border-mist-light"
          >
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity - 1)}
              aria-label={dict.cart.decrease}
              className="size-9 cursor-pointer text-ink-soft hover:text-ink"
            >
              −
            </button>
            <span aria-live="polite" className="w-8 text-center text-sm tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity + 1)}
              disabled={line.quantity >= MAX_QUANTITY}
              aria-label={dict.cart.increase}
              className="size-9 cursor-pointer text-ink-soft hover:text-ink disabled:opacity-30"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(line.key)}
            className="cursor-pointer text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {dict.cart.remove}
          </button>
        </div>
      </div>
    </li>
  );
}
