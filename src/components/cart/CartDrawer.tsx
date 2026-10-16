"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Drawer, DrawerHeader } from "@/components/ui/Drawer";
import { fill } from "@/i18n/format";
import { CartLineItem } from "./CartLineItem";
import { useCart } from "./CartProvider";
import { CartSubtotal } from "./CartSummary";

export function CartDrawer() {
  const { locale, dict } = useI18n();
  const { lines, count, isOpen, close } = useCart();

  return (
    <Drawer open={isOpen} onClose={close} label={dict.cart.title}>
      <DrawerHeader
        title={
          <>
            {dict.cart.title}
            {count > 0 && (
              <span className="ml-3 text-ink-soft">{fill(dict.cart.itemCount, { count })}</span>
            )}
          </>
        }
        closeLabel={dict.nav.close}
        onClose={close}
      />

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          <p className="font-serif text-2xl">{dict.cart.empty}</p>
          <ButtonLink href={`/${locale}/collection`} variant="secondary" onClick={close}>
            {dict.cart.continue}
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-mist-light overflow-y-auto overscroll-contain px-6">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} onNavigate={close} />
            ))}
          </ul>
          <div className="space-y-6 border-t border-mist-light px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <CartSubtotal />
            <ButtonLink href={`/${locale}/checkout`} size="lg" className="w-full" onClick={close}>
              {dict.cart.checkout}
            </ButtonLink>
            <div className="text-center">
              <ButtonLink href={`/${locale}/cart`} variant="quiet" onClick={close}>
                {dict.cart.viewCart}
              </ButtonLink>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
