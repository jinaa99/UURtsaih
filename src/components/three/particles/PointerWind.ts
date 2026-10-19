import type { PointerState } from "./ParticleSystem";

const OFF = -1e5;
const MAX_SPEED = 1500; // px/s

/**
 * Хулгана / хуруу хөдлөхөд салхи. Canvas `pointer-events: none` тул window-оос сонсоно —
 * утсан дээр scroll хийж буй хурууны touchmove ч салхи үүсгэнэ.
 */
export class PointerWind {
  private clientX = 0;
  private clientY = 0;
  private lastMove = -Infinity;
  private state: PointerState = { x: OFF, y: OFF, vx: 0, vy: 0, active: 0 };

  private onPointer = (e: PointerEvent) => this.move(e.clientX, e.clientY);
  private onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) this.move(t.clientX, t.clientY);
  };
  private onLeave = () => (this.lastMove = -Infinity);

  attach() {
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    window.addEventListener("touchstart", this.onTouch, { passive: true });
    window.addEventListener("touchmove", this.onTouch, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onLeave);
    window.addEventListener("blur", this.onLeave);
  }

  detach() {
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("touchstart", this.onTouch);
    window.removeEventListener("touchmove", this.onTouch);
    document.documentElement.removeEventListener("pointerleave", this.onLeave);
    window.removeEventListener("blur", this.onLeave);
  }

  private move(x: number, y: number) {
    this.clientX = x;
    this.clientY = y;
    this.lastMove = performance.now();
  }

  /** Canvas-ийн төвөөс хэмжсэн px (y дээш), хурд px/s — зөөлрүүлсэн. */
  sample(dt: number, rect: DOMRect): PointerState {
    const s = this.state;
    const live = performance.now() - this.lastMove < 700;
    s.active += ((live ? 1 : 0) - s.active) * Math.min(1, dt * 5);
    if (this.lastMove === -Infinity) return s;

    const x = this.clientX - rect.left - rect.width / 2;
    const y = rect.height / 2 - (this.clientY - rect.top);
    if (s.x === OFF) {
      s.x = x;
      s.y = y;
    }
    const k = Math.min(1, dt * 10);
    s.vx += ((x - s.x) / Math.max(dt, 1e-3) - s.vx) * k;
    s.vy += ((y - s.y) / Math.max(dt, 1e-3) - s.vy) * k;
    // Хэт хурдан хөдөлгөөн радиал "цацраг" үүсгэхгүй байх дээд хязгаар.
    const speed = Math.hypot(s.vx, s.vy);
    if (speed > MAX_SPEED) {
      s.vx *= MAX_SPEED / speed;
      s.vy *= MAX_SPEED / speed;
    }
    s.x = x;
    s.y = y;
    return s;
  }
}
