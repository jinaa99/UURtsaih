export type ParticleSettings = {
  /** Салхины эргэлдээ (curl noise) хүч, px/s². */
  turbulence: number;
  /** Салхи ширхэгийг хэр хол зөөх — дэлгэцийн өндрийн хувь. */
  drift: number;
  /** Curl noise-ийн давтамж (их = жижиг эргүүлэг). */
  curlScale: number;
  pointerStrength: number;
  /** px */
  pointerRadius: number;
  /** Чөлөөт ширхэгийн өнгө (hex) ба хэр холих. */
  tint: string;
  tintMix: number;
  fiberAlpha: number;
  /** Ширхэгийн урт — ширхэг хоорондын зайн үржвэр. */
  fiberSize: number;
  /** < 0 бол scroll-оос; 0..1 бол debug-д гараар. */
  progressOverride: number;
};

export const defaultSettings: ParticleSettings = {
  turbulence: 140,
  drift: 0.8,
  curlScale: 1.6,
  pointerStrength: 1600,
  pointerRadius: 110,
  tint: "#e9dcc6",
  tintMix: 0.35,
  fiberAlpha: 0.55,
  fiberSize: 2.6,
  progressOverride: -1,
};

export const PARTICLE_COUNT = { high: 100_000, low: 30_000 } as const;
export type Tier = keyof typeof PARTICLE_COUNT;

/**
 * Сул утас = coarse pointer + цөөн цөм эсвэл бага санах ой.
 * (Safari `deviceMemory` өгдөггүй.) Буруу таавал ParticleField-ийн FPS хамгаалалт
 * эхний секундүүдэд 60fps хүрэхгүй бол `low` руу буулгана.
 */
export function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  return coarse && (cores <= 4 || memory <= 4) ? "low" : "high";
}

/** "#rrggbb" → [r, g, b] 0..1 (sRGB утгаараа — shader зургийн пикселтэй адил орон зайд). */
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
