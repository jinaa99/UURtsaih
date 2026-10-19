/**
 * Нүүрний scroll (0..1) дээрх үе шатууд. Хүрээнүүд давхцаж, smoothstep-ээр
 * холилдох тул шилжилт бүр тасралтгүй. three импортлохгүй — HTML давхарга ч ашиглана.
 *
 *   зураг → салхи → утас (helix) → нэхмэл (knit) → даавуу → өнгө сонгох
 */
export const STAGES = {
  windEnd: 0.28,
  gather: [0.27, 0.42],
  knit: [0.46, 0.62],
  clothSnap: [0.63, 0.71],
  clothFade: [0.69, 0.77],
  wave: [0.73, 0.85],
  ui: [0.82, 0.88],
} as const;

/**
 * Бүлгийн текст (HTML) харагдах хүрээ. Үе шат бүрийн голд гарч, дараагийнх эхлэхээс өмнө арилна;
 * даавууны текст өнгө сонголт (ui) гарч ирэхэд зай тавьж өгнө.
 */
export const CHAPTERS = {
  wind: [0.06, 0.26],
  thread: [0.3, 0.46],
  knit: [0.49, 0.64],
  cloth: [0.68, 0.83],
} as const;
export type ChapterId = keyof typeof CHAPTERS;
/** Бүлгийн текст гарах/арилах зөөлөн хэсэг (progress-ийн нэгжээр). */
export const CHAPTER_FADE = 0.035;

/** Section-ий өндөр (svh). Үе шат бүрт ~1 дэлгэц гүйлгэлт. */
export const HERO_SCROLL_SVH = 700;

/** Даавууны байрлал — дэлгэцийн өндрийн хувиар (centerY: дээрээс). */
export const CLOTH_LAYOUT = { centerY: 0.42, height: 0.5, maxWidth: 0.86, aspect: 1.5 } as const;

export function smoothstep(x: number, [a, b]: readonly [number, number]) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
