"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { ButtonLink } from "@/components/ui/Button";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSubtotal } from "./CartSummary";

export function CartPageView() {
  const { locale, dict } = useI18n();
  const { lines } = useCart();

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl">{dict.cart.empty}</p>
        <ButtonLink href={`/${locale}/collection`} variant="secondary" className="mt-8">
          {dict.cart.continue}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-20">
      <ul className="divide-y divide-mist-light border-y border-mist-light">
        {lines.map((line) => (
          <CartLineItem key={line.key} line={line} />
        ))}
      </ul>
      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <CartSubtotal />
        <ButtonLink href={`/${locale}/checkout`} size="lg" className="w-full">
          {dict.cart.checkout}
        </ButtonLink>
      </aside>
    </div>
  );
}
