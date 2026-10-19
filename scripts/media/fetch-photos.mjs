// Unsplash / Pixabay / Pexels-ээс зураг хайж, сонгосныг нь татна.
// Key-ууд (.env.local) — аль байгааг нь ашиглана:
//   UNSPLASH_ACCESS_KEY  https://unsplash.com/oauth/applications (demo: 50 хүсэлт/цаг)
//   PIXABAY_API_KEY      https://pixabay.com/api/docs/ (энгийн key: хамгийн ихдээ 1280px)
//   PEXELS_API_KEY       https://www.pexels.com/api/
//
//   node scripts/media/fetch-photos.mjs search            # бүх ангилал → contact sheet
//   node scripts/media/fetch-photos.mjs search hero       # нэг ангилал
//   node scripts/media/fetch-photos.mjs search hero --query "x" --query "y"  # нэмэлт хайлт (cache-тэй нэгтгэнэ)
//   node scripts/media/fetch-photos.mjs add <category> <ref> "<alt mn>" "<alt en>"
//
// <ref> нь contact sheet дээрх шошго: us-<id> | pb-<id> | px-<id>.
// Contact sheet-ийг нүдээр шалгаад (тод царай, лого, брэнд байхгүй) л `add` хийнэ.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { CACHE, PUBLIC_MEDIA, ROOT, download, toWebp, today, upsert } from "./lib.mjs";

const QUERIES = {
  hero: ["gobi desert sunrise", "steppe fog dawn", "desert dunes morning mist"],
  herd: ["goats grassland", "goat herd mountains", "mongolia goats"],
  "fiber-macro": ["wool yarn macro", "knitted wool texture close up", "wool fibers"],
  landscape: ["mongolia steppe mountains", "mongolia landscape", "altai mountains"],
  "fabric-bg": ["cream knit fabric texture", "beige wool fabric", "cream linen fabric texture"],
  "product-placeholder": ["knit sweater flat lay", "cashmere scarf folded", "knit beanie"],
};
/** Эх зургийн хамгийн бага өргөн. Hero-д 3000px+. */
const MIN_WIDTH = { hero: 3000 };
const DEFAULT_MIN_WIDTH = 2400;
const SIZES = [2400, 1200];
const UTM = "utm_source=uur&utm_medium=referral";
const landscapeOnly = (category) => !["product-placeholder", "fiber-macro"].includes(category);

async function loadEnv() {
  const env = { ...process.env };
  try {
    const text = await readFile(path.join(ROOT, ".env.local"), "utf8");
    for (const m of text.matchAll(/^(\w+)\s*=\s*"?([^"\n]*)"?/gm)) env[m[1]] ??= m[2].trim();
  } catch {}
  return env;
}
const env = await loadEnv();

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url.split("?")[0]}: ${await res.text()}`);
  return res.json();
}

/**
 * Provider бүр: search(query, category) → Candidate[], get(id) → Candidate.
 * Candidate: { ref, width, height, thumb, original, credit, alt, downloadLocation?, availableWidth? }
 */
const providers = {
  us: {
    key: env.UNSPLASH_ACCESS_KEY,
    headers() {
      return { Authorization: `Client-ID ${this.key}`, "Accept-Version": "v1" };
    },
    // Unsplash+ зургийг хасна (premium/plus туг эсвэл plus.unsplash.com хост).
    isPlus: (p) =>
      p.premium === true || p.plus === true || p.urls.raw.includes("plus.unsplash.com"),
    map(p) {
      return {
        ref: `us-${p.id}`,
        width: p.width,
        height: p.height,
        thumb: p.urls.small,
        original: `${p.urls.raw}&w=3200&fm=jpg&q=90`,
        alt: p.alt_description ?? "",
        credit: {
          source: "unsplash",
          sourceUrl: `${p.links.html}?${UTM}`,
          author: p.user.name,
          authorUrl: `${p.user.links.html}?${UTM}`,
          license: "Unsplash License",
          licenseUrl: "https://unsplash.com/license",
        },
        // API guideline: татахдаа download_location-г дуудна.
        downloadLocation: p.links.download_location,
      };
    },
    async search(q, category) {
      const o = landscapeOnly(category) ? "&orientation=landscape" : "";
      const data = await getJson(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20&content_filter=high${o}`,
        this.headers(),
      );
      return data.results.filter((p) => !this.isPlus(p)).map((p) => this.map(p));
    },
    async get(id) {
      const p = await getJson(`https://api.unsplash.com/photos/${id}`, this.headers());
      if (this.isPlus(p)) throw new Error(`us-${id} нь Unsplash+ зураг — авахгүй.`);
      return this.map(p);
    },
  },

  pb: {
    key: env.PIXABAY_API_KEY,
    map(h) {
      // imageURL/fullHDURL нь зөвхөн "full API access"-тэй key-д ирнэ.
      const original = h.imageURL ?? h.fullHDURL ?? h.largeImageURL;
      const availableWidth = h.imageURL ? h.imageWidth : h.fullHDURL ? 1920 : 1280;
      return {
        ref: `pb-${h.id}`,
        width: h.imageWidth,
        height: h.imageHeight,
        availableWidth,
        thumb: h.webformatURL,
        original,
        alt: h.tags ?? "",
        credit: {
          source: "pixabay",
          sourceUrl: h.pageURL,
          author: h.user,
          authorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
          license: "Pixabay Content License",
          licenseUrl: "https://pixabay.com/service/license-summary/",
        },
      };
    },
    async search(q, category) {
      const o = landscapeOnly(category) ? "&orientation=horizontal" : "";
      const data = await getJson(
        `https://pixabay.com/api/?key=${this.key}&q=${encodeURIComponent(q)}&image_type=photo&safesearch=true&per_page=20${o}`,
      );
      return data.hits.map((h) => this.map(h));
    },
    async get(id) {
      const data = await getJson(`https://pixabay.com/api/?key=${this.key}&id=${id}`);
      if (!data.hits[0]) throw new Error(`pb-${id} олдсонгүй`);
      return this.map(data.hits[0]);
    },
  },

  px: {
    key: env.PEXELS_API_KEY,
    map(p) {
      return {
        ref: `px-${p.id}`,
        width: p.width,
        height: p.height,
        thumb: p.src.medium,
        original: p.src.original,
        alt: p.alt ?? "",
        credit: {
          source: "pexels",
          sourceUrl: p.url,
          author: p.photographer,
          authorUrl: p.photographer_url,
          license: "Pexels License",
          licenseUrl: "https://www.pexels.com/license/",
        },
      };
    },
    async search(q, category) {
      const o = landscapeOnly(category) ? "&orientation=landscape" : "";
      const data = await getJson(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=15&size=large${o}`,
        { Authorization: this.key },
      );
      return data.photos.map((p) => this.map(p));
    },
    async get(id) {
      return this.map(
        await getJson(`https://api.pexels.com/v1/photos/${id}`, { Authorization: this.key }),
      );
    },
  },
};

const active = Object.entries(providers).filter(([, p]) => p.key);
if (active.length === 0) {
  console.error(
    "API key алга. .env.local-д UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY эсвэл PEXELS_API_KEY-ийн аль нэгийг нэм.",
  );
  process.exit(1);
}

/** `queries` өгвөл үндсэн жагсаалтын оронд тэдгээрийг хайж, үр дүнг өмнөх cache-тэй нэгтгэнэ. */
async function search(category, queries) {
  const min = MIN_WIDTH[category] ?? DEFAULT_MIN_WIDTH;
  const seen = new Map();
  for (const [name, provider] of active) {
    for (const q of queries ?? QUERIES[category]) {
      try {
        for (const c of await provider.search(q, category)) {
          if (c.width >= min && !seen.has(c.ref)) seen.set(c.ref, c);
        }
      } catch (e) {
        console.warn(`! ${name} "${q}": ${e.message.slice(0, 160)}`);
      }
    }
  }
  const candidates = [...seen.values()].slice(0, 30);
  const dir = path.join(CACHE, "review");
  await mkdir(path.join(dir, "thumbs"), { recursive: true });
  const cacheFile = path.join(dir, `${category}.json`);
  let merged = candidates;
  if (queries) {
    try {
      const prev = JSON.parse(await readFile(cacheFile, "utf8"));
      merged = [...prev, ...candidates.filter((c) => !prev.some((p) => p.ref === c.ref))];
    } catch {}
  }
  await writeFile(cacheFile, JSON.stringify(merged, null, 2));

  // 6 баганатай contact sheet, зураг бүр дээр ref + эх хэмжээ.
  const T = 320;
  const cols = 6;
  const rows = Math.max(1, Math.ceil(candidates.length / cols));
  const tiles = await Promise.all(
    candidates.map(async (c, i) => {
      const thumb = await download(c.thumb, path.join(dir, "thumbs", `${c.ref}.jpg`));
      const warn = c.availableWidth && c.availableWidth < DEFAULT_MIN_WIDTH ? " ⚠" : "";
      const label = Buffer.from(
        `<svg width="${T}" height="28"><rect width="100%" height="100%" fill="black" opacity="0.65"/><text x="8" y="19" font-size="14" fill="white" font-family="sans-serif">${c.ref} · ${c.width}×${c.height}${warn}</text></svg>`,
      );
      const img = await sharp(thumb)
        .resize(T, T, { fit: "cover" })
        .composite([{ input: label, top: T - 28, left: 0 }])
        .toBuffer();
      return { input: img, left: (i % cols) * T, top: Math.floor(i / cols) * T };
    }),
  );
  const sheet = path.join(dir, `${category}.png`);
  await sharp({ create: { width: cols * T, height: rows * T, channels: 3, background: "#ffffff" } })
    .composite(tiles)
    .png()
    .toFile(sheet);
  console.log(`${category}: ${candidates.length} нэр дэвшигч → ${sheet}`);
}

async function add(category, ref, altMn, altEn) {
  if (!QUERIES[category]) throw new Error(`Үл мэдэх ангилал: ${category}`);
  const prefix = ref.slice(0, 2);
  const id = ref.slice(3);
  const provider = providers[prefix];
  if (!provider?.key) throw new Error(`${ref}: ${prefix} provider-ийн key алга.`);

  // Хайлтын cache-д байвал API дуудахгүй (Unsplash demo: 50 хүсэлт/цаг).
  let c;
  try {
    const cached = JSON.parse(
      await readFile(path.join(CACHE, "review", `${category}.json`), "utf8"),
    );
    c = cached.find((x) => x.ref === ref);
  } catch {}
  c ??= await provider.get(id);
  if (c.availableWidth && c.availableWidth < DEFAULT_MIN_WIDTH) {
    throw new Error(
      `${ref}: энэ key-ээр хамгийн ихдээ ${c.availableWidth}px авах боломжтой (${DEFAULT_MIN_WIDTH}px шаардлагатай). Pixabay full API access хэрэгтэй.`,
    );
  }
  // Unsplash API guideline: татахдаа download_location-г дуудна.
  if (c.downloadLocation) await getJson(c.downloadLocation, providers.us.headers());
  const raw = await download(c.original, path.join(CACHE, c.credit.source, `${id}.jpg`));
  const slug = `${category}-${c.credit.source}-${id}`.toLowerCase();
  const files = await toWebp(raw, path.join(PUBLIC_MEDIA, category, slug), SIZES);
  await upsert({
    kind: "photo",
    id: slug,
    category,
    placeholder: category === "product-placeholder",
    alt: { mn: altMn ?? "", en: altEn ?? c.alt },
    ...c.credit,
    downloadedAt: today(),
    width: c.width,
    height: c.height,
    files,
  });
  console.log("✓", slug);
}

const [cmd, ...args] = process.argv.slice(2);
console.log("providers:", active.map(([n]) => n).join(", "));
if (cmd === "search") {
  // search <category> --query "a" --query "b"
  const qi = args.indexOf("--query");
  if (qi > 0) {
    const queries = args.filter((_, i) => args[i - 1] === "--query");
    await search(args[0], queries);
  } else {
    for (const c of args.length ? args : Object.keys(QUERIES)) await search(c);
  }
} else if (cmd === "add") {
  await add(...args);
} else {
  console.log("usage: search [category] | add <category> <ref> <alt mn> <alt en>");
}
