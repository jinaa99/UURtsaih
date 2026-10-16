import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/CartPageView";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return {
    ...pageMetadata({
      locale,
      path: "/cart",
      title: dict.cart.title,
      description: dict.meta.description,
    }),
    robots: { index: false },
  };
}

export default async function CartPage() {
  const dict = await getDictionary();
  return (
    <main className="mx-auto max-w-screen-xl px-5 pt-28 sm:px-10 sm:pt-40">
      <h1 className="mb-10 text-title">{dict.cart.title}</h1>
      <CartPageView />
    </main>
  );
}
