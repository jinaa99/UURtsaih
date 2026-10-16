import { getDictionary } from "@/i18n/dictionaries";

// Phase 0 placeholder. Scroll түүх (Phase 2–3) энэ хуудсыг орлоно.
export default async function Home() {
  const dict = await getDictionary();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="text-xs tracking-luxe text-camel-deep uppercase">{dict.home.eyebrow}</p>
      <h1 className="mt-8 max-w-3xl text-5xl sm:text-7xl">{dict.home.title}</h1>
      <p className="mt-8 max-w-md text-ink-soft">{dict.home.lead}</p>

      <ul aria-hidden className="mt-20 flex gap-3">
        {["bg-cream-deep", "bg-sand", "bg-camel", "bg-mist"].map((c) => (
          <li key={c} className={`size-10 rounded-full ${c}`} />
        ))}
      </ul>
    </main>
  );
}
