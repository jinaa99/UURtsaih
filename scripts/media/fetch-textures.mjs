// CC0 даавууны текстур татна: Poly Haven + ambientCG.
// Ажиллуулах: node scripts/media/fetch-textures.mjs
import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { CACHE, PUBLIC_MEDIA, download, toWebp, today, upsert } from "./lib.mjs";

const SIZES = [2048, 1024];

const polyhaven = ["cotton_jersey", "knitted_fleece", "poly_wool_herringbone"];
const ambientcg = ["Fabric019"];

async function fromPolyHaven(id) {
  const info = await (await fetch(`https://api.polyhaven.com/info/${id}`)).json();
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
  const pick = { diffuse: "Diffuse", normal: "nor_gl", roughness: "Rough" };
  const maps = {};
  for (const [key, field] of Object.entries(pick)) {
    const url = files[field]["2k"].jpg.url;
    const raw = await download(url, path.join(CACHE, "polyhaven", id, path.basename(url)));
    maps[key] = await toWebp(raw, path.join(PUBLIC_MEDIA, "textures", id, key), SIZES, 88);
  }
  await upsert({
    kind: "texture",
    id: `tex-${id.replace(/_/g, "-")}`,
    category: "cloth-texture",
    placeholder: false,
    name: info.name,
    source: "polyhaven",
    sourceUrl: `https://polyhaven.com/a/${id}`,
    author: Object.keys(info.authors).join(", "),
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    downloadedAt: today(),
    maps,
  });
  console.log("✓", id);
}

async function fromAmbientCG(id) {
  const dir = path.join(CACHE, "ambientcg", id);
  const zip = await download(
    `https://ambientcg.com/get?file=${id}_2K-JPG.zip`,
    path.join(dir, `${id}_2K-JPG.zip`),
  );
  const out = path.join(dir, "unzipped");
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  execFileSync("unzip", ["-q", "-o", zip, "-d", out]);
  const names = await readdir(out);
  const find = (suffix) => {
    const n = names.find((f) => f.endsWith(suffix));
    if (!n) throw new Error(`${id}: ${suffix} олдсонгүй (${names.join(", ")})`);
    return path.join(out, n);
  };
  const pick = { diffuse: "_Color.jpg", normal: "_NormalGL.jpg", roughness: "_Roughness.jpg" };
  const maps = {};
  for (const [key, suffix] of Object.entries(pick)) {
    maps[key] = await toWebp(
      find(suffix),
      path.join(PUBLIC_MEDIA, "textures", id.toLowerCase(), key),
      SIZES,
      88,
    );
  }
  await upsert({
    kind: "texture",
    id: `tex-${id.toLowerCase()}`,
    category: "cloth-texture",
    placeholder: false,
    name: id,
    source: "ambientcg",
    sourceUrl: `https://ambientcg.com/view?id=${id}`,
    author: "ambientCG (Lennart Demes)",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    downloadedAt: today(),
    maps,
  });
  console.log("✓", id);
}

for (const id of polyhaven) await fromPolyHaven(id);
for (const id of ambientcg) await fromAmbientCG(id);
