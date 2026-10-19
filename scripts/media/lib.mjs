// Media pipeline-ийн нийтлэг хэсэг: татах, WebP болгох, registry → src/content/media.ts.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const PUBLIC_MEDIA = path.join(ROOT, "public/media");
/** Түүхий татсан файлууд (git-д орохгүй). */
export const CACHE = path.join(ROOT, "node_modules/.cache/uur-media");
const REGISTRY = path.join(ROOT, "scripts/media/registry.json");
const MEDIA_TS = path.join(ROOT, "src/content/media.ts");

export const today = () => new Date().toISOString().slice(0, 10);

export async function download(url, dest, headers = {}) {
  await mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url, { headers: { "User-Agent": "uur-media-script", ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return dest;
}

/**
 * Зургийг WebP болгож хэд хэдэн өргөнөөр хадгална. Эх зураг жижиг бол томруулахгүй.
 * Буцаах: { [width]: "/media/..." } public URL-ууд.
 */
export async function toWebp(input, outBase, widths, quality = 78) {
  await mkdir(path.dirname(outBase), { recursive: true });
  const files = {};
  for (const w of widths) {
    const out = `${outBase}-${w}.webp`;
    await sharp(input)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(out);
    files[w] = "/" + path.relative(path.join(ROOT, "public"), out).split(path.sep).join("/");
  }
  return files;
}

export async function readRegistry() {
  try {
    return JSON.parse(await readFile(REGISTRY, "utf8"));
  } catch {
    return [];
  }
}

export async function writeRegistry(reg) {
  reg.sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));
  await writeFile(REGISTRY, JSON.stringify(reg, null, 2) + "\n");
  await renderMediaTs(reg);
}

export async function upsert(entry) {
  const reg = await readRegistry();
  const i = reg.findIndex((e) => e.id === entry.id);
  if (i >= 0) reg[i] = entry;
  else reg.push(entry);
  await writeRegistry(reg);
}

async function renderMediaTs(reg) {
  const body = `/**
 * ЗУРГИЙН БҮРТГЭЛ — scripts/media/*.mjs автоматаар үүсгэнэ, гараар бүү засварла.
 * Эх өгөгдөл: scripts/media/registry.json.
 *
 * Зураг бүрийн эх URL, зохиогч, лиценз, татсан огноо энд байна.
 * \`placeholder: true\` — бүтээгдэхүүний түр зураг, бодит зургаар солигдоно.
 */
import type { MediaAsset } from "@/lib/media";

export const media = ${JSON.stringify(reg, null, 2)} as const satisfies readonly MediaAsset[];
`;
  await writeFile(MEDIA_TS, body);
}
