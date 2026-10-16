import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { CurrencySwitch } from "./CurrencySwitch";
import { LocaleSwitch } from "./LocaleSwitch";

export async function Header() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-5 py-5 text-xs tracking-luxe uppercase sm:px-10 sm:py-7">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-6">
        <Link href={`/${locale}`} className="font-serif text-xl tracking-[0.3em] normal-case">
          ÜÜR
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link href={`/${locale}/collection`}>{dict.nav.collection}</Link>
          <Link href={`/${locale}/story`}>{dict.nav.story}</Link>
        </nav>

        <div className="flex items-center gap-6 sm:gap-8">
          <LocaleSwitch current={locale} label={dict.nav.language} />
          <span aria-hidden className="h-3 w-px bg-mist-light" />
          <CurrencySwitch label={dict.nav.currency} />
          <Link href={`/${locale}/cart`} className="hidden sm:inline">
            {dict.nav.cart}
          </Link>
        </div>
      </div>
    </header>
  );
}
