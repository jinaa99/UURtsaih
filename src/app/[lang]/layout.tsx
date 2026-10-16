import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { Header } from "@/components/ui/Header";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { defaultCurrencyFor } from "@/lib/currency";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${cormorant.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh bg-cream text-ink">
        <CurrencyProvider defaultCurrency={defaultCurrencyFor(locale)}>
          <Header />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
