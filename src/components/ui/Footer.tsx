import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export async function Footer() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <footer className="mt-32 border-t border-mist-light px-5 py-14 sm:px-10">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-3xl tracking-[0.3em]">ÜÜR</p>
          <p className="mt-4 text-xs text-ink-soft">{dict.footer.rights}</p>
        </div>
        <nav aria-label={dict.nav.main} className="flex gap-8 text-eyebrow">
          <Link href={`/${locale}/collection`}>{dict.nav.collection}</Link>
          <Link href={`/${locale}/story`}>{dict.nav.story}</Link>
          <Link href={`/${locale}/cart`}>{dict.nav.cart}</Link>
        </nav>
      </div>
    </footer>
  );
}
