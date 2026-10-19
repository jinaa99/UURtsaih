// Зургийг бүртгэл болон public/media-аас устгана.
// Ажиллуулах: node scripts/media/remove.mjs <id> [<id> ...]
import { rm } from "node:fs/promises";
import path from "node:path";
import { ROOT, readRegistry, writeRegistry } from "./lib.mjs";

const ids = process.argv.slice(2);
const reg = await readRegistry();
for (const id of ids) {
  const entry = reg.find((e) => e.id === id);
  if (!entry) {
    console.warn("? олдсонгүй:", id);
    continue;
  }
  const files =
    entry.kind === "photo"
      ? Object.values(entry.files)
      : entry.kind === "audio"
        ? [entry.file]
        : Object.values(entry.maps).flatMap((m) => Object.values(m));
  for (const f of files) await rm(path.join(ROOT, "public", f), { force: true });
  if (entry.kind === "texture") {
    await rm(path.dirname(path.join(ROOT, "public", files[0])), { recursive: true, force: true });
  }
  console.log("✗", id);
}
await writeRegistry(reg.filter((e) => !ids.includes(e.id)));
