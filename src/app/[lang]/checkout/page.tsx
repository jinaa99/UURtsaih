import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { plannedPaymentProviders } from "@/lib/payment";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return {
    ...pageMetadata({
      locale,
      path: "/checkout",
      title: dict.checkout.title,
      description: dict.checkout.description,
    }),
    robots: { index: false },
  };
}

export default async function CheckoutPage() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const providers = plannedPaymentProviders.map((p) => ({ id: p.id, name: p.displayName[locale] }));

  return (
    <main data-checkout className="mx-auto max-w-screen-xl px-5 pt-28 sm:px-10 sm:pt-40">
      <h1 className="mb-12 text-title">{dict.checkout.title}</h1>
      <CheckoutForm providers={providers} />
    </main>
  );
}
