import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

/** Бүх хуудсанд доод зүүн буланд байх жижиг "Дэлгүүр" товч → цуглуулга. */
export async function ShopButton() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <Link
      href={`/${locale}/collection`}
      className="shop-fab fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-30 flex h-10 items-center gap-2.5 rounded-full bg-ink/90 px-4 text-eyebrow text-cream shadow-[0_6px_24px_-8px_rgb(43_39_35/0.45)] backdrop-blur-md transition-colors duration-(--duration-slow) ease-silk hover:bg-ink-soft sm:bottom-6 sm:left-6"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M3 5.5h10l-.8 8.5H3.8z" />
        <path d="M5.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" />
      </svg>
      {dict.nav.shop}
    </Link>
  );
}
