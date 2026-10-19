/**
 * Нүүрний hero (3D эсвэл статик fallback) анхны frame-ээ зурсан эсэх.
 * Loading screen үүнийг хүлээнэ. Client navigation-д module хадгалагдана.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markHeroReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
  listeners.clear();
}

/** Бэлэн болмогц (аль хэдийн бэлэн бол шууд) дуудна. Буцаах: цуцлах функц. */
export function onHeroReady(cb: () => void) {
  if (ready) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}
