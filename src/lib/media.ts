// content/media.ts нь энэ файлаас зөвхөн type импортлодог тул тойрог (cycle) үүсэхгүй.
import { media } from "@/content/media";
import type { ImageSlot, LocalizedText } from "@/lib/catalog/types";

export type MediaCategory =
  | "hero"
  | "herd"
  | "fiber-macro"
  | "landscape"
  | "fabric-bg"
  | "product-placeholder"
  | "cloth-texture"
  | "ambient-audio";

export type MediaSource =
  "pexels" | "pixabay" | "unsplash" | "polyhaven" | "ambientcg" | "freesound";

type Credit = {
  source: MediaSource;
  /** Эх хуудасны URL. */
  sourceUrl: string;
  author: string;
  authorUrl?: string;
  license: string;
  licenseUrl: string;
  /** YYYY-MM-DD */
  downloadedAt: string;
};

export type PhotoAsset = Credit & {
  kind: "photo";
  id: string;
  category: Exclude<MediaCategory, "cloth-texture" | "ambient-audio">;
  /** true: бүтээгдэхүүний түр зураг — бодит зургаар солигдоно. */
  placeholder: boolean;
  alt: LocalizedText;
  /** Эх зургийн хэмжээ. */
  width: number;
  height: number;
  /** Өргөн → public URL ("2400", "1200"). */
  files: Readonly<Record<string, string>>;
};

/** 3D даавууны PBR текстур (2048/1024 — GPU-д 2-ын зэрэг). */
export type TextureAsset = Credit & {
  kind: "texture";
  id: string;
  category: "cloth-texture";
  placeholder: false;
  name: string;
  maps: Readonly<Record<"diffuse" | "normal" | "roughness", Readonly<Record<string, string>>>>;
};

/** Орчны дуу (CC0) — нүүрний салхины дуу. */
export type AudioAsset = Credit & {
  kind: "audio";
  id: string;
  category: "ambient-audio";
  placeholder: false;
  name: string;
  /** Секунд. */
  duration: number;
  /** Public URL (mp3). */
  file: string;
};

export type MediaAsset = PhotoAsset | TextureAsset | AudioAsset;

// ---- Lookup ----

type Entry = (typeof media)[number];
export type PhotoId = Extract<Entry, { kind: "photo" }>["id"];
export type TextureId = Extract<Entry, { kind: "texture" }>["id"];
export type AudioId = Extract<Entry, { kind: "audio" }>["id"];

const assets = media as readonly MediaAsset[];

export function getPhoto(id: PhotoId): PhotoAsset {
  const a = assets.find((x) => x.id === id);
  if (!a || a.kind !== "photo") throw new Error(`Unknown photo: ${id}`);
  return a;
}

export function getTexture(id: TextureId): TextureAsset {
  const a = assets.find((x) => x.id === id);
  if (!a || a.kind !== "texture") throw new Error(`Unknown texture: ${id}`);
  return a;
}

export function getAudio(id: AudioId): AudioAsset {
  const a = assets.find((x) => x.id === id);
  if (!a || a.kind !== "audio") throw new Error(`Unknown audio: ${id}`);
  return a;
}

/** Зургийг бүтээгдэхүүний ImageSlot болгоно (2400px хувилбар, харьцаа хадгалагдана). */
export function photoSlot(id: PhotoId): ImageSlot {
  const p = getPhoto(id);
  const width = Math.min(2400, p.width);
  return {
    src: p.files["2400"],
    alt: p.alt,
    width,
    height: Math.round((width * p.height) / p.width),
  };
}

export const allPhotos = () => assets.filter((a): a is PhotoAsset => a.kind === "photo");

/**
 * `object-cover` бүхий бүтэн өргөнтэй зургийн `sizes`. Дэлгэц зургаас "босоо" байвал
 * өргөн нь өндрөөр тодорхойлогдоно (жишээ нь утсан дээр 100vw биш ~180vh).
 * `heightVh` — зургийн хайрцагны өндөр (vh), parallax-ийн илүүдлийг оруулна.
 */
export function coverSizes(photo: Pick<PhotoAsset, "width" | "height">, heightVh = 100) {
  const w = (photo.width / photo.height) * heightVh;
  return `(max-aspect-ratio: ${Math.round(w * 10)}/1000) ${Math.ceil(w)}vh, 100vw`;
}
