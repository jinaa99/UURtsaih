"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { CurrencySwitch } from "./CurrencySwitch";
import { Drawer, DrawerHeader } from "./Drawer";
import { LocaleSwitch } from "./LocaleSwitch";

export function MobileMenu() {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/collection`, label: dict.nav.collection },
    { href: `/${locale}/story`, label: dict.nav.story },
    { href: `/${locale}/cart`, label: dict.nav.cart },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="-ml-2 cursor-pointer p-2 text-eyebrow md:hidden"
      >
        {dict.nav.menu}
      </button>
      <Drawer open={open} onClose={close} side="left" label={dict.nav.main}>
        <DrawerHeader title="ÜÜR" closeLabel={dict.nav.close} onClose={close} />
        <nav aria-label={dict.nav.main} className="flex-1 px-6 py-10">
          <ul className="space-y-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="font-serif text-4xl">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-5 border-t border-mist-light px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-eyebrow">
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">{dict.nav.language}</span>
            <LocaleSwitch current={locale} label={dict.nav.language} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-soft">{dict.nav.currency}</span>
            <CurrencySwitch label={dict.nav.currency} />
          </div>
        </div>
      </Drawer>
    </>
  );
}
