// Монголын хилийн SVG path үүсгэнэ → src/content/mongolia-map.ts (гараар бүү засварла).
// Эх: Natural Earth 1:50m Admin 0 (public domain). Ажиллуулах: node scripts/map/build-mongolia.mjs
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";

/** Түүхийн цэгүүд (lon, lat). Үйлдвэрийн байршил — брэндийн мэдээлэл ирэхээр солино. */
const places = {
  gobi: [104.42, 43.57], // Өмнөговь (Даланзадгад)
  mid: [106.27, 45.76], // Дундговь (Мандалговь) — замын дунд цэг
  factory: [106.92, 47.92], // Улаанбаатар — placeholder
};

const WIDTH = 1000;
const LAT0 = 47;
const geo = await (await fetch(SRC)).json();
const mng = geo.features.find((f) => f.properties.ADM0_A3 === "MNG");
if (!mng) throw new Error("MNG олдсонгүй");
const rings =
  mng.geometry.type === "Polygon"
    ? [mng.geometry.coordinates[0]]
    : mng.geometry.coordinates.map((p) => p[0]);

const all = rings.flat();
const minLon = Math.min(...all.map((c) => c[0]));
const maxLon = Math.max(...all.map((c) => c[0]));
const minLat = Math.min(...all.map((c) => c[1]));
const maxLat = Math.max(...all.map((c) => c[1]));
const kx = Math.cos((LAT0 * Math.PI) / 180);
const scale = WIDTH / ((maxLon - minLon) * kx);
const project = ([lon, lat]) => [(lon - minLon) * kx * scale, (maxLat - lat) * scale];
const height = Math.round((maxLat - minLat) * scale);

const r = (n) => Math.round(n * 10) / 10;
const d = rings
  .map((ring) => {
    const pts = ring.map(project);
    // ~1.5 нэгжээс ойр цэгүүдийг хасна.
    const kept = pts.filter((p, i) => {
      if (i === 0) return true;
      const q = pts[i - 1];
      return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1.5;
    });
    return "M" + kept.map((p) => `${r(p[0])} ${r(p[1])}`).join("L") + "Z";
  })
  .join("");

const points = Object.fromEntries(Object.entries(places).map(([k, v]) => [k, project(v).map(r)]));

const out = `/**
 * МОНГОЛЫН ГАЗРЫН ЗУРАГ — scripts/map/build-mongolia.mjs үүсгэнэ, гараар бүү засварла.
 * Эх: Natural Earth 1:50m (public domain). Проекц: equirectangular, cos(${LAT0}°) засвартай.
 */
export const mongoliaMap = ${JSON.stringify({ width: WIDTH, height, d, points }, null, 2)} as const;
`;
await writeFile(path.join(ROOT, "src/content/mongolia-map.ts"), out);
console.log("✓", WIDTH, "×", height, d.length, "chars", points);
