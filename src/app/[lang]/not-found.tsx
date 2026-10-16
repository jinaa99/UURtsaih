import { ButtonLink } from "@/components/ui/Button";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="text-eyebrow text-camel-deep">404</p>
      <h1 className="mt-6 text-title">{dict.notFound.title}</h1>
      <p className="mt-6 max-w-md text-ink-soft">{dict.notFound.body}</p>
      <ButtonLink href={`/${locale}`} variant="secondary" className="mt-10">
        {dict.notFound.home}
      </ButtonLink>
    </main>
  );
}
