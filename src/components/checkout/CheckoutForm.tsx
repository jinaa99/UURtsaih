"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CartSubtotal } from "@/components/cart/CartSummary";
import { PriceTag } from "@/components/currency/PriceTag";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ONE_SIZE } from "@/lib/catalog/types";

type PlannedProvider = { id: string; name: string };

const input =
  "mt-2 block h-12 w-full border border-mist-light bg-transparent px-4 text-base placeholder:text-mist focus:border-ink focus:outline-none";

function Field({
  label,
  optional,
  className = "",
  ...props
}: { label: string; optional?: string } & React.ComponentProps<"input">) {
  return (
    <label className={`block ${className}`}>
      <span className="text-eyebrow">
        {label}
        {optional && <span className="ml-2 text-ink-soft normal-case">({optional})</span>}
      </span>
      <input className={input} required={!optional} {...props} />
    </label>
  );
}

/**
 * Checkout маягт. Төлбөр нээгдээгүй тул илгээхэд юу ч хадгалахгүй,
 * сервер рүү юу ч явуулахгүй — зөвхөн "Төлбөр удахгүй" мэдэгдэл харуулна.
 */
export function CheckoutForm({ providers }: { providers: PlannedProvider[] }) {
  const { locale, dict } = useI18n();
  const { lines } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const t = dict.checkout;

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl">{t.emptyCart}</p>
        <ButtonLink href={`/${locale}/collection`} variant="secondary" className="mt-8">
          {dict.cart.continue}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-16 lg:grid-cols-[1fr_24rem] lg:gap-24">
      <form
        className="space-y-14"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <fieldset className="space-y-6">
          <legend className="mb-6 text-heading">{t.contact}</legend>
          <Field label={t.email} type="email" name="email" autoComplete="email" />
          <Field label={t.phone} type="tel" name="phone" autoComplete="tel" />
        </fieldset>

        <fieldset className="grid gap-6 sm:grid-cols-2">
          <legend className="mb-6 text-heading">{t.shippingAddress}</legend>
          <Field label={t.fullName} name="name" autoComplete="name" className="sm:col-span-2" />
          <Field
            label={t.country}
            name="country"
            autoComplete="country-name"
            defaultValue={locale === "mn" ? "Монгол" : ""}
          />
          <Field label={t.city} name="city" autoComplete="address-level1" />
          <Field label={t.district} name="district" autoComplete="address-level2" />
          <Field label={t.address} name="address" autoComplete="street-address" />
          <Field label={t.notes} name="notes" optional={t.optional} className="sm:col-span-2" />
        </fieldset>

        <fieldset>
          <legend className="mb-6 text-heading">{t.payment}</legend>
          <div className="border border-mist-light bg-cream-deep p-6">
            <p className="font-serif text-xl">{t.paymentSoonTitle}</p>
            <p className="mt-2 text-sm text-ink-soft">{t.paymentSoonBody}</p>
            <ul className="mt-6 space-y-3">
              {providers.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between border border-mist-light px-4 py-3 text-sm text-ink-soft"
                >
                  {p.name}
                  <span className="text-eyebrow">{t.comingSoon}</span>
                </li>
              ))}
            </ul>
          </div>
        </fieldset>

        <div className="space-y-4">
          <Button type="submit" size="lg" className="w-full">
            {t.submit}
          </Button>
          <p role="status" className="min-h-6 text-sm text-camel-deep">
            {submitted ? t.submitted : ""}
          </p>
        </div>
      </form>

      <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-heading">{t.summary}</h2>
        <ul className="divide-y divide-mist-light border-y border-mist-light">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-4 py-4 text-sm">
              <span>
                {l.name[locale]} × {l.quantity}
                <span className="block text-ink-soft">
                  {l.color.name[locale]} · {l.size === ONE_SIZE ? dict.product.oneSize : l.size}
                </span>
              </span>
              <PriceTag
                price={{ MNT: l.price.MNT * l.quantity, USD: l.price.USD * l.quantity }}
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
        <CartSubtotal />
      </aside>
    </div>
  );
}
