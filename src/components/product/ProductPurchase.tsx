"use client";

import { useId, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { PriceTag } from "@/components/currency/PriceTag";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { ONE_SIZE, type Product } from "@/lib/catalog/types";

/** Өнгө, хэмжээ сонгох ба сагсанд хийх. Утсан дээр товч доор үргэлж харагдана. */
export function ProductPurchase({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const { add, open } = useCart();
  const ids = useId();

  const isOneSize = product.sizes.length === 1 && product.sizes[0] === ONE_SIZE;
  const [colorId, setColorId] = useState(product.colors[0].id);
  const [size, setSize] = useState<string | null>(isOneSize ? ONE_SIZE : null);
  const [needsSize, setNeedsSize] = useState(false);

  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];

  function addToCart() {
    if (!size) {
      setNeedsSize(true);
      document.getElementById(`${ids}-size`)?.focus();
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      color,
      size,
      image: product.images[0]?.src ?? null,
    });
    open();
  }

  const option =
    "cursor-pointer border transition-colors duration-(--duration-slow) ease-silk has-checked:border-ink has-focus-visible:outline has-focus-visible:outline-camel";

  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="mb-4 text-eyebrow">
          {dict.product.color} <span className="ml-2 text-ink-soft">{color.name[locale]}</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {product.colors.map((c) => (
            <label
              key={c.id}
              title={c.name[locale]}
              className={`${option} rounded-full border-transparent p-1`}
            >
              <input
                type="radio"
                name={`${ids}-color`}
                value={c.id}
                checked={c.id === colorId}
                onChange={() => setColorId(c.id)}
                className="sr-only"
                aria-label={c.name[locale]}
              />
              <span
                className="block size-8 rounded-full ring-1 ring-ink/10"
                style={{ backgroundColor: c.swatch }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset id={`${ids}-size`} tabIndex={-1} className="outline-none">
        <legend className="mb-4 text-eyebrow">{dict.product.size}</legend>
        {isOneSize ? (
          <p className="text-sm text-ink-soft">{dict.product.oneSize}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <label
                key={s}
                className={`${option} flex h-11 min-w-14 items-center justify-center px-4 text-sm ${size === s ? "" : "border-mist-light hover:border-ink-soft"}`}
              >
                <input
                  type="radio"
                  name={`${ids}-size-radio`}
                  value={s}
                  checked={size === s}
                  onChange={() => {
                    setSize(s);
                    setNeedsSize(false);
                  }}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        )}
        <p role="status" className="mt-3 min-h-5 text-sm text-camel-deep">
          {needsSize ? dict.product.chooseSize : ""}
        </p>
      </fieldset>

      {/* Утсан дээр дэлгэцийн доор наалттай; md-ээс дээш энгийн байрлалд. */}
      <div
        data-bottom-bar
        className="fixed inset-x-0 bottom-0 z-30 border-t border-mist-light bg-cream/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
      >
        <div className="flex items-center gap-4">
          <PriceTag price={product.price} className="text-lg tabular-nums md:hidden" />
          <Button size="lg" className="flex-1 md:w-full" onClick={addToCart}>
            {dict.product.addToCart}
          </Button>
        </div>
      </div>
    </div>
  );
}
