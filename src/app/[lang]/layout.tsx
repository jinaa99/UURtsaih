import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Footer } from "@/components/ui/Footer";
import { Header } from "@/components/ui/Header";
import { ShopButton } from "@/components/ui/ShopButton";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { defaultCurrencyFor } from "@/lib/currency";
import { pageMetadata, siteUrl } from "@/lib/seo";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  // Монгол Ү/ү, Ө/ө нь cyrillic-ext-д (U+04AE, U+04E8) — preload-д заавал.
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  // Зөвхөн ашиглагддаг жин (display 300, гарчиг 400) — preload-ийн хэмжээ LCP-тэй өрсөлдөхгүй.
  weight: ["300", "400"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  // Биеийн текст fallback-аар (size-adjusted) шууд харагдана; preload нь LCP гарчиг (Cormorant)-ийн фонттой өрсөлдөхгүй.
  preload: false,
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#F6F1E8",
};

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const base = pageMetadata({
    locale,
    path: "",
    title: dict.meta.title,
    description: dict.meta.description,
  });
  return {
    ...base,
    metadataBase: siteUrl,
    title: { default: dict.meta.title, template: `%s — ${dict.meta.siteName}` },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <html lang={locale} className={`${cormorant.variable} ${manrope.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col bg-cream text-ink">
        <I18nProvider locale={locale} dict={dict}>
          <CurrencyProvider defaultCurrency={defaultCurrencyFor(locale)}>
            <CartProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
              <ShopButton />
              <CartDrawer />
            </CartProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
