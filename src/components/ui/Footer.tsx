import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export async function Footer() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <footer className="mt-32 border-t border-mist-light px-5 pt-14 pb-28 sm:px-10">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Logo variant="stacked" className="text-[64px]" />
          <p className="mt-4 text-xs text-ink-soft">{dict.footer.rights}</p>
          <Link
            href={`/${locale}/credits`}
            className="mt-2 inline-block text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {dict.nav.credits}
          </Link>
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
