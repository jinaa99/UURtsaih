// CC0 дуу (freesound preview mp3) татаж бүртгэнэ.
// Ажиллуулах: node scripts/media/fetch-audio.mjs
// Freesound-ийн эх (wav) файл login шаарддаг тул нийтэд нээлттэй HQ preview-г (128 kbps mp3) авна.
import path from "node:path";
import { PUBLIC_MEDIA, download, today, upsert } from "./lib.mjs";

const sounds = [
  {
    id: "audio-wind-freesound-697217",
    category: "ambient-audio",
    name: "Looping Gentle Wind Ambience on an Open Desert Plain",
    preview: "https://cdn.freesound.org/previews/697/697217_7678208-hq.mp3",
    sourceUrl: "https://freesound.org/people/dhallcomposer/sounds/697217/",
    author: "dhallcomposer",
    authorUrl: "https://freesound.org/people/dhallcomposer/",
    duration: 41.1,
  },
];

for (const s of sounds) {
  const file = path.join(PUBLIC_MEDIA, "audio", `${s.id.replace(/^audio-/, "")}.mp3`);
  await download(s.preview, file);
  await upsert({
    kind: "audio",
    id: s.id,
    category: s.category,
    placeholder: false,
    name: s.name,
    source: "freesound",
    sourceUrl: s.sourceUrl,
    author: s.author,
    authorUrl: s.authorUrl,
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    downloadedAt: today(),
    duration: s.duration,
    file: "/" + path.relative(path.join(PUBLIC_MEDIA, ".."), file).split(path.sep).join("/"),
  });
  console.log("✓", s.id);
}
