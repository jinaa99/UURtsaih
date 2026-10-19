// Open Graph зураг (1200×630 JPEG — нийгмийн сүлжээнүүд WebP-г тогтвортой дэмждэггүй).
// Ажиллуулах: node scripts/media/build-og.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./lib.mjs";

const W = 1200;
const H = 630;

const cards = [
  { out: "default", photo: "hero/hero-unsplash-xgbugdiobvm-2400.webp", focus: 0.6 },
  { out: "story", photo: "hero/hero-unsplash-svaofknuoak-2400.webp", focus: 0.5 },
];

// Брэндийн лого (scripts/brand/build-logo.mjs-ийн гаралт) — босоо хувилбар, төвд.
const logoSvg = await readFile(path.join(ROOT, "public/brand/uur-logo-stacked.svg"));
const LOGO_W = 300;
const logo = await sharp(logoSvg, { density: 600 }).resize({ width: LOGO_W }).png().toBuffer();
const { height: LOGO_H } = await sharp(logo).metadata();
const logoTop = Math.round(H / 2 - LOGO_H / 2 - 30);

const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="60%">
      <stop offset="0" stop-color="#f6f1e8" stop-opacity="0.86"/>
      <stop offset="1" stop-color="#f6f1e8" stop-opacity="0.28"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="${logoTop + LOGO_H + 62}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif"
        font-size="18" letter-spacing="7" fill="#5c554d">MONGOLIAN CASHMERE</text>
</svg>`);

for (const c of cards) {
  const src = path.join(ROOT, "public/media", c.photo);
  const meta = await sharp(src).metadata();
  // Эх зураг дээр 1200:630 харьцаатай хүрээг `focus` (0 дээд … 1 доод) орчимд тайрна.
  const cropH = Math.min(meta.height, Math.round((meta.width * H) / W));
  const top = Math.max(
    0,
    Math.min(meta.height - cropH, Math.round(meta.height * c.focus - cropH / 2)),
  );
  await sharp(src)
    .extract({ left: 0, top, width: meta.width, height: cropH })
    .resize(W, H, { fit: "cover" })
    .composite([
      { input: overlay },
      { input: logo, left: Math.round((W - LOGO_W) / 2), top: logoTop },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(ROOT, "public/og", `${c.out}.jpg`));
  console.log("✓ og/" + c.out + ".jpg");
}
