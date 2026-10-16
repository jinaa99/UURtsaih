"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = { mn: "МН", en: "EN" };

export function LocaleSwitch({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav aria-label={label} className="flex items-center gap-3">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${rest ? `/${rest}` : ""}`}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
          className="text-ink-soft transition-colors duration-(--duration-slow) ease-silk hover:text-ink aria-[current]:text-ink"
        >
          {labels[locale]}
        </Link>
      ))}
    </nav>
  );
}
