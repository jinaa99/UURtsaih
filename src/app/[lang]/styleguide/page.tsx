import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/currency";

// Дотоод хэрэглээний хуудас — хайлтын системд индекслэхгүй.
export const metadata: Metadata = {
  title: "Styleguide — ÜÜR",
  robots: { index: false, follow: false },
};

const colors = [
  { name: "cream", hex: "#F6F1E8", use: "Үндсэн дэвсгэр" },
  { name: "cream-deep", hex: "#EFE7DA", use: "Карт, хэсгийн дэвсгэр" },
  { name: "sand", hex: "#E4D8C4", use: "Зургийн placeholder, сонголт" },
  { name: "camel", hex: "#B08A5F", use: "Онцлох (зөвхөн том текст / чимэглэл)" },
  { name: "camel-deep", hex: "#8A6A46", use: "Eyebrow, жижиг онцлох текст" },
  { name: "mist", hex: "#A9A6A0", use: "Чимэглэл (текстэд бүү хэрэглэ)" },
  { name: "mist-light", hex: "#D6D3CD", use: "Хүрээ, хуваагч зураас" },
  { name: "ink-soft", hex: "#5C554D", use: "Туслах текст" },
  { name: "ink", hex: "#2B2723", use: "Үндсэн текст, primary товч" },
];

const samplePrice = { MNT: 890_000, USD: 259 };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-mist-light py-16">
      <h2 className="mb-10 text-eyebrow text-camel-deep">{title}</h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-32 pb-24 sm:px-10">
      <p className="text-eyebrow text-camel-deep">ÜÜR</p>
      <h1 className="mt-4 mb-16 text-title">Styleguide</h1>

      <Section title="Өнгө / Colour">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {colors.map((c) => (
            <li key={c.name}>
              <div
                className="aspect-square w-full border border-ink/5"
                style={{ backgroundColor: c.hex }}
              />
              <p className="mt-3 text-sm">{c.name}</p>
              <p className="text-xs text-ink-soft">{c.hex}</p>
              <p className="mt-1 text-xs text-ink-soft">{c.use}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Фонт / Typeface">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-eyebrow text-ink-soft">Serif — Cormorant Garamond</p>
            <p className="mt-4 font-serif text-5xl font-light">Аа Өө Үү Aa</p>
            <p className="mt-4 font-serif text-2xl break-all">
              АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ
            </p>
            <p className="font-serif text-2xl italic">Говийн үүрийн гэгээ — Gobi first light</p>
          </div>
          <div>
            <p className="text-eyebrow text-ink-soft">Sans — Manrope</p>
            <p className="mt-4 font-sans text-5xl font-light">Аа Өө Үү Aa</p>
            <p className="mt-4 text-base">
              абвгдеёжзийклмноөпрстуүфхцчшщъыьэюя
              <br />
              abcdefghijklmnopqrstuvwxyz 0123456789
            </p>
            <p className="mt-2 text-base font-medium">Manrope 500 — Сагсанд хийх</p>
          </div>
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-10">
          <div>
            <p className="mb-2 text-xs text-ink-soft">text-display</p>
            <p className="text-display">Үүрийн гэгээ</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-ink-soft">text-title</p>
            <p className="text-title">Woven from first light</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-ink-soft">text-heading</p>
            <p className="text-heading">Ноолуурын арчилгаа</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-ink-soft">text-eyebrow</p>
            <p className="text-eyebrow text-camel-deep">Шинэ цуглуулга</p>
          </div>
          <div className="max-w-xl">
            <p className="mb-2 text-xs text-ink-soft">text-lead</p>
            <p className="text-lead">
              Placeholder догол мөр. Брэндийн бодит текст ирэхэд энд солигдоно. Мөрийн өндөр нь
              уншихад тайван.
            </p>
          </div>
          <div className="max-w-xl">
            <p className="mb-2 text-xs text-ink-soft">body (16px / 300)</p>
            <p>Placeholder body текст. The quick brown fox — үсгийн жин 300, мөрийн өндөр 1.7.</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-ink-soft">Үнэ (жишээ формат)</p>
            <p className="text-lg">
              {formatPrice(samplePrice, "MNT")} <span className="mx-3 text-mist">/</span>
              {formatPrice(samplePrice, "USD")}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Товч / Buttons">
        <div className="flex flex-wrap items-center gap-6">
          <Button>Сагсанд хийх</Button>
          <Button variant="secondary">Дэлгэрэнгүй</Button>
          <Button variant="quiet">Цуглуулга үзэх</Button>
          <Button disabled>Дууссан</Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Button size="lg">Add to bag</Button>
          <Button size="lg" variant="secondary">
            View collection
          </Button>
        </div>
      </Section>

      <Section title="Хөдөлгөөн / Motion">
        <ul className="space-y-2 text-sm text-ink-soft">
          <li>ease-silk — cubic-bezier(0.22, 1, 0.36, 1) · ихэнх шилжилт</li>
          <li>ease-breath — cubic-bezier(0.65, 0, 0.35, 1) · удаан, тэгш хэмтэй</li>
          <li>duration-slow — 900ms · duration-slower — 1600ms</li>
          <li>prefers-reduced-motion үед бүх хөдөлгөөн унтарна</li>
        </ul>
      </Section>
    </main>
  );
}
