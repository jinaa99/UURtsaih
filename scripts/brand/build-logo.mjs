// ÜÜR лого: "нэхмэл үүр" тэмдэг (тэнгэрийн хаяа дээр мандах нар — дотроо нэхмэлийн эгнээ)
// + Cormorant Garamond 300 wordmark (OFL; үсгийг path болгосон — фонт ачаалахаас хамаарахгүй).
// Ажиллуулах: node scripts/brand/build-logo.mjs
// Гаралт: src/components/brand/logo-data.ts, public/brand/*.svg, src/app/icon.svg,
//         src/app/apple-icon.png, src/app/favicon.ico. Дараа нь OG: node scripts/media/build-og.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";
import { CACHE, ROOT, download } from "../media/lib.mjs";

const FONT_URL =
  "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_qE6GnM.ttf";
const INK = "#2b2723";
const ACCENT = "#7d5f3e"; // camel-deep
const CREAM = "#f6f1e8";
const ACCENT_ON_DARK = "#c9a77d";

// ---- Тэмдэг (viewBox 0 0 64 64) ----
const SUN = { cx: 32, cy: 40, r: 20 };
const ROWS = [35, 30, 25]; // нэхмэлийн эгнээ
const r1 = (n) => Math.round(n * 100) / 100;
const mark = {
  viewBox: "0 0 64 64",
  sun: `M${SUN.cx - SUN.r} ${SUN.cy}a${SUN.r} ${SUN.r} 0 0 1 ${2 * SUN.r} 0`,
  rows: ROWS.map((y) => {
    const w = Math.sqrt(SUN.r ** 2 - (SUN.cy - y) ** 2);
    return `M${r1(SUN.cx - w)} ${y}h${r1(2 * w)}`;
  }),
  horizon: "M6 40h52",
};
const markSvg = (accent, line, sw = 1) =>
  `<path d="${mark.sun}" fill="none" stroke="${accent}" stroke-width="${1.4 * sw}"/>` +
  mark.rows.map((d) => `<path d="${d}" stroke="${accent}" stroke-width="${1.1 * sw}"/>`).join("") +
  `<path d="${mark.horizon}" stroke="${line}" stroke-width="${1.4 * sw}"/>`;

// ---- Wordmark ----
const ttf = await download(FONT_URL, path.join(CACHE, "brand", "cormorant-garamond-300.ttf"));
const font = opentype.loadSync(ttf);
const SIZE = 100;
const TRACKING = 0.32;
let x = 0;
const glyphPaths = [];
for (const ch of "ÜÜR") {
  const g = font.charToGlyph(ch);
  glyphPaths.push(g.getPath(x, SIZE, SIZE).toPathData(2));
  x += (g.advanceWidth / font.unitsPerEm) * SIZE + TRACKING * SIZE;
}
// Бодит хүрээгээр (Ü-ийн цэгээс R-ийн суурь хүртэл) viewBox.
let minY = Infinity;
let maxY = -Infinity;
let minX = Infinity;
let maxX = -Infinity;
{
  let cx = 0;
  for (const ch of "ÜÜR") {
    const g = font.charToGlyph(ch);
    const b = g.getPath(cx, SIZE, SIZE).getBoundingBox();
    minX = Math.min(minX, b.x1);
    maxX = Math.max(maxX, b.x2);
    minY = Math.min(minY, b.y1);
    maxY = Math.max(maxY, b.y2);
    cx += (g.advanceWidth / font.unitsPerEm) * SIZE + TRACKING * SIZE;
  }
}
const word = {
  viewBox: `${r1(minX)} ${r1(minY)} ${r1(maxX - minX)} ${r1(maxY - minY)}`,
  width: r1(maxX - minX),
  height: r1(maxY - minY),
  d: glyphPaths.join(""),
};

// Тэмдгийн бодит хүрээ (stroke-ийг оруулаад) — lockup-д хоосон зайгүй байрлуулна.
const MB = { x: 6, y: 19.2, w: 52, h: 21.6 };
// ---- src/components/brand/logo-data.ts ----
await writeFile(
  path.join(ROOT, "src/components/brand/logo-data.ts"),
  `/**
 * ЛОГОНЫ ӨГӨГДӨЛ — scripts/brand/build-logo.mjs үүсгэнэ, гараар бүү засварла.
 * Wordmark: Cormorant Garamond 300 (SIL OFL), tracking ${TRACKING}em, path болгосон.
 */
export const logoMark = ${JSON.stringify({ ...mark, crop: MB }, null, 2)} as const;

export const logoWord = ${JSON.stringify(word, null, 2)} as const;
`,
);

// ---- public/brand/*.svg ----
const HORIZON_IN_MB = 40 - MB.y; // тэнгэрийн хаяа (y=40) хүрээний дээрээс
const baseline = SIZE - minY; // wordmark-ийн суурь шугам хүрээний дээрээс
const wordSvg = (fill, x0, y0, s) =>
  `<g transform="translate(${r1(x0)} ${r1(y0)}) scale(${r1(s)}) translate(${r1(-minX)} ${r1(-minY)})"><path d="${word.d}" fill="${fill}"/></g>`;
const markAt = (accent, ink, x0, y0, w, sw = 1) =>
  `<svg x="${r1(x0)}" y="${r1(y0)}" width="${r1(w)}" height="${r1((w * MB.h) / MB.w)}" viewBox="${MB.x} ${MB.y} ${MB.w} ${MB.h}" overflow="visible">${markSvg(accent, ink, sw)}</svg>`;
const svgDoc = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r1(w)} ${r1(h)}" width="${r1(w)}" height="${r1(h)}">${body}</svg>\n`;

// Хэвтээ: тэмдгийн тэнгэрийн хаяа = wordmark-ийн суурь шугам. Өндөр = wordmark (100 нэгж).
const H = word.height;
const hMarkW = H * 1.3;
const hMarkScale = hMarkW / MB.w;
const hMarkTop = baseline - HORIZON_IN_MB * hMarkScale;
const hGap = H * 0.42;
const horizontal = (accent, ink) =>
  svgDoc(
    hMarkW + hGap + word.width,
    H,
    markAt(accent, ink, 0, hMarkTop, hMarkW, 2.2 / hMarkScale) + wordSvg(ink, hMarkW + hGap, 0, 1),
  );
// Босоо: дээр тэмдэг, доор wordmark (төвд).
const sMarkW = word.width * 0.5;
const sMarkH = (sMarkW * MB.h) / MB.w;
const sGap = H * 0.5;
const stacked = (accent, ink) =>
  svgDoc(
    word.width,
    sMarkH + sGap + H,
    markAt(accent, ink, (word.width - sMarkW) / 2, 0, sMarkW, 1.4 / (sMarkW / MB.w)) +
      wordSvg(ink, 0, sMarkH + sGap, 1),
  );
const outDir = path.join(ROOT, "public/brand");
await mkdir(outDir, { recursive: true });
const files = {
  "uur-logo.svg": horizontal(ACCENT, INK),
  "uur-logo-light.svg": horizontal(ACCENT_ON_DARK, CREAM),
  "uur-logo-stacked.svg": stacked(ACCENT, INK),
  "uur-logo-stacked-light.svg": stacked(ACCENT_ON_DARK, CREAM),
  "uur-wordmark.svg": svgDoc(word.width, H, wordSvg(INK, 0, 0, 1)),
  "uur-mark.svg": svgDoc(MB.w, MB.h, markAt(ACCENT, INK, 0, 0, MB.w)),
};
for (const [name, svg] of Object.entries(files)) await writeFile(path.join(outDir, name), svg);

// ---- Favicon / app icon: бараан хавтан дээр тэмдэг ----
const tile = (size, radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}"><rect width="64" height="64" rx="${radius}" fill="${INK}"/><g transform="translate(0 -4)">${markSvg(ACCENT_ON_DARK, CREAM, 1.6)}</g></svg>`;
await writeFile(path.join(ROOT, "src/app/icon.svg"), tile(64, 14) + "\n");
await sharp(Buffer.from(tile(180, 0)))
  .png()
  .toFile(path.join(ROOT, "src/app/apple-icon.png"));
// favicon.ico — 32px PNG-ийг ICO-д ороосон (бүх browser дэмждэг).
const png32 = await sharp(Buffer.from(tile(32, 7)))
  .png()
  .toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6);
ico.writeUInt8(32, 7);
ico.writeUInt8(0, 8);
ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png32.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile(path.join(ROOT, "src/app/favicon.ico"), Buffer.concat([ico, png32]));

console.log("✓ logo-data.ts, public/brand/*.svg, icon.svg, apple-icon.png, favicon.ico");
