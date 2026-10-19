import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CartButton } from "@/components/cart/CartButton";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { CurrencySwitch } from "./CurrencySwitch";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileMenu } from "./MobileMenu";

export async function Header() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-cream/85 px-5 backdrop-blur-md sm:px-10">
      <div className="mx-auto grid h-16 max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center text-eyebrow sm:h-20">
        <div className="flex items-center gap-10">
          <MobileMenu />
          <nav aria-label={dict.nav.main} className="hidden items-center gap-10 md:flex">
            <Link href={`/${locale}/collection`}>{dict.nav.collection}</Link>
            <Link href={`/${locale}/story`}>{dict.nav.story}</Link>
          </nav>
        </div>

        <Link href={`/${locale}`} aria-label={`ÜÜR — ${dict.nav.home}`} className="block">
          <Logo className="text-[18px] sm:text-[22px]" />
        </Link>

        <div className="flex items-center justify-end gap-6 sm:gap-8">
          <div className="hidden items-center gap-6 md:flex">
            <LocaleSwitch current={locale} label={dict.nav.language} />
            <span aria-hidden className="h-3 w-px bg-mist-light" />
            <CurrencySwitch label={dict.nav.currency} />
          </div>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
