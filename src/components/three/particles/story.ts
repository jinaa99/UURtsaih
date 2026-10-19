import { Color, PerspectiveCamera, SRGBColorSpace } from "three";
import { CLOTH_LAYOUT, STAGES, smoothstep } from "./stages";

/**
 * Нэг frame-ийн түүхийн төлөв: scroll progress → үе шатын жин, даавууны байрлал,
 * сонгосон өнгө (зөөлөн шилжинэ). ParticleSystem ба Cloth хоёулаа үүнийг уншина.
 */
export class Story {
  time = 0;
  /** Зөөлрүүлсэн scroll progress. */
  progress = 0;
  private started = false;
  wind = 0;
  revealWind = 0;
  gather = 0;
  /** Утасны ээрэлт (radian) — scroll-оор. */
  spin = 0;
  knit = 0;
  clothSnap = 0;
  clothFade = 0;
  wave = 0;
  /** Даавууны тэгш өнцөгт (world px, y дээш): cx, cy, w, h. */
  rect: [number, number, number, number] = [0, 0, 1, 1];
  rows = 16;
  stitches = 24;
  /** Утас/даавууны өнгө — linear (material) ба sRGB (particle shader). */
  readonly yarn = new Color();
  readonly yarnSrgb: [number, number, number] = [0, 0, 0];

  private target = new Color();
  private hasColor = false;

  update(dt: number, target: number, width: number, height: number, hex: string) {
    this.time += dt;
    // Scroll гэнэт үсэрсэн ч (End товч, scrollbar чирэх) үе шатуудыг тасралтгүй дамжина.
    if (!this.started) {
      this.progress = target;
      this.started = true;
    }
    this.progress += (target - this.progress) * (1 - Math.exp(-dt * 5));
    const p = this.progress;
    // Статик зураг CSS-ээр (raw scroll) уусдаг тул ширхэгийн гарч ирэлт ч raw-аар — хооронд нь цоорхой үлдэхгүй.
    this.revealWind = Math.min(1, target / STAGES.windEnd);
    this.wind = Math.min(1, p / STAGES.windEnd);
    this.gather = smoothstep(p, STAGES.gather);
    this.spin = Math.max(0, p - STAGES.gather[0]) * 55 + this.time * 0.15;
    this.knit = smoothstep(p, STAGES.knit);
    this.clothSnap = smoothstep(p, STAGES.clothSnap);
    this.clothFade = smoothstep(p, STAGES.clothFade);
    this.wave = smoothstep(p, STAGES.wave);

    const h = height * CLOTH_LAYOUT.height;
    const w = Math.min(width * CLOTH_LAYOUT.maxWidth, h * CLOTH_LAYOUT.aspect);
    this.rect = [0, height * (0.5 - CLOTH_LAYOUT.centerY), w, h];
    this.rows = Math.min(22, Math.max(12, Math.round(h / 24)));
    this.stitches = Math.max(8, Math.round((this.rows * w * 1.25) / h));

    // Өнгө солигдохдоо ~1 секундэд зөөлөн шилжинэ.
    this.target.set(hex);
    if (!this.hasColor) {
      this.yarn.copy(this.target);
      this.hasColor = true;
    }
    this.yarn.lerp(this.target, 1 - Math.exp(-dt * 3));
    const srgb = this.yarn.getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
    this.yarnSrgb[0] = srgb.r;
    this.yarnSrgb[1] = srgb.g;
    this.yarnSrgb[2] = srgb.b;
  }
}

/** z = 0 хавтгайд 1 нэгж = 1 CSS px байхаар perspective камерыг байрлуулна. Камерын зайг буцаана. */
export function fitCamera(camera: PerspectiveCamera, height: number) {
  const z = height / 2 / Math.tan((camera.fov * Math.PI) / 360);
  if (Math.abs(camera.position.z - z) > 0.01) {
    camera.position.set(0, 0, z);
    camera.near = z * 0.05;
    camera.far = z * 6;
    camera.updateProjectionMatrix();
  }
  return z;
}
