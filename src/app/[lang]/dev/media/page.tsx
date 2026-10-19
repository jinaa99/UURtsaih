import type { Metadata } from "next";
import Image from "next/image";
import { media } from "@/content/media";
import type { MediaAsset, MediaCategory } from "@/lib/media";

// Дотоод хуудас: татсан бүх зургийг жижиг хэмжээгээр харуулна.
export const metadata: Metadata = {
  title: "Media — dev",
  robots: { index: false, follow: false },
};

const categories: { id: MediaCategory; title: string; need: string }[] = [
  { id: "hero", title: "Hero", need: "Говь / тал, үүр цайх, манан — хэвтээ, 3000px+" },
  { id: "herd", title: "Сүрэг", need: "Ямаа эсвэл сүрэг тал нутагт" },
  { id: "fiber-macro", title: "Ноос, утас — макро", need: "Ноос, утас, нэхмэлийн ойрын зураг" },
  { id: "landscape", title: "Уул, тал", need: "Монголын уул, тал нутгийн өргөн зураг (түүх)" },
  { id: "fabric-bg", title: "Дэвсгэр даавуу", need: "Цөцгий/элсэн өнгийн хоосон даавуу, нэхмэл" },
  {
    id: "product-placeholder",
    title: "Бүтээгдэхүүн (placeholder)",
    need: "Цамц, ороолт, малгай — лого, брэндгүй",
  },
  { id: "cloth-texture", title: "3D даавууны текстур (CC0)", need: "Poly Haven / ambientCG" },
  { id: "ambient-audio", title: "Орчны дуу (CC0)", need: "Салхины зөөлөн loop — freesound" },
];

function Credit({ a }: { a: MediaAsset }) {
  return (
    <dl className="mt-2 space-y-0.5 text-[11px] leading-snug text-ink-soft">
      <dt className="sr-only">id</dt>
      <dd className="font-medium text-ink">{a.id}</dd>
      <dd>
        <a
          href={a.sourceUrl}
          className="underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          {a.source}
        </a>{" "}
        · {a.author}
      </dd>
      <dd>
        <a
          href={a.licenseUrl}
          className="underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          {a.license}
        </a>{" "}
        · {a.downloadedAt}
      </dd>
      {a.kind === "photo" && (
        <dd>
          {a.width}×{a.height}
        </dd>
      )}
    </dl>
  );
}

export default function MediaPage() {
  const assets = media as readonly MediaAsset[];

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pt-28 pb-24 sm:px-10">
      <p className="text-eyebrow text-camel-deep">dev</p>
      <h1 className="mt-3 text-title">Media</h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-soft">
        {assets.length} зураг. Эх мэдээлэл: <code>src/content/media.ts</code>. Нэмэх:{" "}
        <code>scripts/media/</code>.
      </p>

      {categories.map((c) => {
        const items = assets.filter((a) => a.category === c.id);
        return (
          <section key={c.id} className="mt-16 border-t border-mist-light pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-heading">
                {c.title} <span className="text-base text-ink-soft">({items.length})</span>
              </h2>
              <p className="text-xs text-ink-soft">{c.need}</p>
            </div>

            {items.length === 0 ? (
              <p className="mt-6 border border-dashed border-mist-light p-6 text-sm text-ink-soft">
                Хоосон — API key хүлээж байна (UNSPLASH_ACCESS_KEY / PIXABAY_API_KEY).
              </p>
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {items.map((a) =>
                  a.kind === "photo" ? (
                    <li key={a.id}>
                      <div className="relative aspect-4/3 overflow-hidden bg-sand">
                        <Image
                          src={a.files["1200"]}
                          alt={a.alt.mn || a.alt.en}
                          fill
                          sizes="240px"
                          className="object-cover"
                        />
                        {a.placeholder && (
                          <span className="absolute top-2 left-2 bg-ink px-2 py-1 text-[10px] tracking-luxe text-cream uppercase">
                            placeholder
                          </span>
                        )}
                      </div>
                      <Credit a={a} />
                    </li>
                  ) : a.kind === "audio" ? (
                    <li key={a.id}>
                      <audio controls preload="none" src={a.file} className="w-full" />
                      <p className="mt-1 text-[10px] text-ink-soft">{a.name}</p>
                      <Credit a={a} />
                    </li>
                  ) : (
                    <li key={a.id}>
                      <div className="grid grid-cols-3 gap-1">
                        {(["diffuse", "normal", "roughness"] as const).map((m) => (
                          <div key={m} className="relative aspect-square overflow-hidden bg-sand">
                            <Image
                              src={a.maps[m]["1024"]}
                              alt={`${a.name} ${m}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="mt-1 text-[10px] text-ink-soft">diffuse · normal · roughness</p>
                      <Credit a={a} />
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
}
