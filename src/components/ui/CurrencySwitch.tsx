"use client";

import { currencies } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";

export function CurrencySwitch({ label }: { label: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div role="group" aria-label={label} className="flex items-center gap-3">
      {currencies.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={c === currency}
          className="cursor-pointer text-ink-soft transition-colors duration-(--duration-slow) ease-silk hover:text-ink aria-pressed:text-ink"
        >
          {c === "MNT" ? "₮" : "$"}
        </button>
      ))}
    </div>
  );
}
