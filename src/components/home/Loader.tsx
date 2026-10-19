"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { onHeroReady } from "@/lib/hero-ready";

/** Client navigation-аар нүүр рүү буцахад дахин харуулахгүй. */
let shown = false;
/** Hero хэзээ ч бэлэн болохгүй (алдаа, удаан төхөөрөмж) бол ч хэрэглэгчийг хүлээлгэхгүй. */
const MAX_WAIT = 6000;
/** Хуудас ачаалсны дараа 3D-ийн анхны frame-ийг хамгийн ихдээ хэр хүлээх (ms). */
const HERO_WAIT = 2500;

/**
 * Эхний ачаалалтын зөөлөн дэлгэц: "ÜÜR" ба нимгэн progress шугам.
 * Шугам нь бодит алхмуудыг дагана — фонт, хуудасны load, hero-ийн анхны frame.
 * JS-гүй үед огт харагдахгүй (globals.css: `scripting: none`).
 */
export function Loader({ label }: { label: string }) {
  const [phase, setPhase] = useState<"on" | "leaving" | "off">(() => (shown ? "off" : "on"));
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "on") return;
    shown = true;
    let done = 0;
    let finished = false;
    const steps = 3;
    const step = () => {
      done++;
    };

    if (document.fonts) document.fonts.ready.then(step);
    else step();
    // 3D нь idle үед ачаалагддаг тул хязгааргүй хүлээхгүй: load-оос хойш HERO_WAIT-ийн дараа үргэлжилнэ.
    let heroDone = false;
    const heroStep = () => {
      if (heroDone) return;
      heroDone = true;
      step();
    };
    let heroTimer = 0;
    const onLoad = () => {
      step();
      heroTimer = window.setTimeout(heroStep, HERO_WAIT);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    const offReady = onHeroReady(heroStep);
    const timeout = window.setTimeout(() => (done = steps), MAX_WAIT);

    // Шугам бодит явцаас үл хамааран удаан "мөлхөнө" — хэзээ ч зогсож харагдахгүй.
    let shownP = 0;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = done >= steps ? 1 : Math.min(0.92, done / steps + 0.12);
      shownP += (target - shownP) * (1 - Math.exp(-dt * (done >= steps ? 6 : 1.6)));
      barRef.current?.style.setProperty("transform", `scaleX(${shownP.toFixed(4)})`);
      if (done >= steps && shownP > 0.995 && !finished) {
        finished = true;
        window.setTimeout(() => setPhase("leaving"), 250);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      clearTimeout(heroTimer);
      offReady();
      window.removeEventListener("load", onLoad);
    };
  }, [phase]);

  if (phase === "off") return null;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-busy={phase === "on"}
      data-leaving={phase === "leaving" ? "" : undefined}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && phase === "leaving") setPhase("off");
      }}
      className="uur-loader fixed inset-0 z-[70] flex flex-col items-center justify-center bg-cream transition-opacity duration-(--duration-slower) ease-silk data-leaving:pointer-events-none data-leaving:opacity-0"
    >
      <Logo variant="stacked" animated className="text-[88px] text-ink sm:text-[112px]" />
      <div className="mt-8 h-px w-32 overflow-hidden bg-ink/10 sm:w-40">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-camel-deep" />
      </div>
    </div>
  );
}
