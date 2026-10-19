"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ButtonLink } from "@/components/ui/Button";
import { markHeroReady } from "@/lib/hero-ready";
import {
  CHAPTER_FADE,
  CHAPTERS,
  CLOTH_LAYOUT,
  HERO_SCROLL_SVH,
  smoothstep,
  STAGES,
  type ChapterId,
} from "./particles/stages";

const ParticleCanvas = dynamic(() => import("./particles/ParticleCanvas"), { ssr: false });

type Env = { particles: boolean; debug: boolean };
const SERVER_ENV: Env = { particles: false, debug: false };
let clientEnv: Env | undefined;

/**
 * Сул төхөөрөмж: data хэмнэх горим, ≤2 цөм / ≤2GB санах ой, эсвэл GPU-гүй (software) WebGL —
 * `failIfMajorPerformanceCaveat` эсвэл SwiftShader/llvmpipe renderer. Эдгээрт 3D огт ачаалахгүй.
 */
function capableGpu(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    // Chrome `gl.RENDERER`-ийг нуудаг; бодит нэр нь debug extension-оор.
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "",
    );
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software/i.test(renderer);
  } catch {
    return false;
  }
}

function weakDevice(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    !!nav.connection?.saveData ||
    (nav.deviceMemory ?? 8) <= 2 ||
    (nav.hardwareConcurrency ?? 4) <= 2
  );
}

function getEnv(): Env {
  if (!clientEnv) {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const params = new URLSearchParams(location.search);
    clientEnv = {
      // `?3d` — шалгахад сул төхөөрөмж дээр ч хүчээр асаана.
      particles: !reduced && (params.has("3d") || (!weakDevice() && capableGpu())),
      debug: params.has("debug"),
    };
  }
  return clientEnv;
}
const noopSubscribe = () => () => {};
/** load-оос хойш 3D-г эхлүүлэх хүртэлх хугацаа (ms) — эхний оролцоо (scroll/touch) үүнийг түрүүлнэ. */
const ARM_DELAY = 3500;

export type Swatch = { id: string; name: string; hex: string };
export type Chapter = { id: ChapterId; eyebrow: string; title: string };

/**
 * Нүүрний scroll үе: section нь өндөр, дотор нь sticky дэлгэц.
 * `background` (статик зураг) нь LCP, JS/WebGL-гүй ба reduced-motion үеийн fallback,
 * мөн scroll эхлэх хүртэл харагдах "яг зураг" — ширхэгүүд задрахын
 * өмнөхөн түүнийг орлоно. Дараа нь утас → нэхмэл → даавуу (stages.ts), төгсгөлд өнгө сонгоно.
 * CSS хувьсагч: `--hero-wind` (салхины үе 0..1), `--hero-ui` (өнгө сонголт харагдах).
 * Бүлгийн текст (`chapters`) бүр өөрийн `--in` / `--out`-тэй (CHAPTERS хүрээгээр).
 *
 * 3D-гүй үед (reduced-motion, сул төхөөрөмж, эсвэл ажиллаж байхдаа хэт удаан) section нь нэг
 * дэлгэц болж, `fallback` (зурагтай бүлгүүд) доор нь харагдана. 3D bundle нь хуудас ачаалж
 * дуусаад idle үед (эсвэл анхны scroll/touch-д) л татагдана — статик зураг тэр хүртэл hero.
 */
export function HeroScrollStage({
  src,
  focusY,
  clothMaps,
  swatches,
  defaultSwatch,
  labels,
  hrefForColor,
  chapters,
  background,
  fallback,
  children,
}: {
  /** Ширхэгт задлах зураг (1200px хангалттай). */
  src: string;
  focusY: number;
  clothMaps: { normal: string; roughness: string };
  swatches: readonly Swatch[];
  defaultSwatch: string;
  labels: { color: string; view: string };
  /** Өнгө → тухайн өнгөөр шүүсэн цуглуулга. */
  hrefForColor: Readonly<Record<string, string>>;
  /** Үе шат бүрийн богино гарчиг (02–05). */
  chapters: readonly Chapter[];
  background: ReactNode;
  /** 3D-гүй хувилбарын бүлгүүд (зурагтай) — hero-ийн доор. */
  fallback: ReactNode;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const swatchesRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(
    () => swatches.find((s) => s.id === defaultSwatch) ?? swatches[0],
  );
  const colorRef = useRef(selected.hex);
  const env = useSyncExternalStore(noopSubscribe, getEnv, () => SERVER_ENV);
  const { debug } = env;
  // Ажиллаж байхдаа сул түвшинд ч удаан бол 3D-г бүрмөсөн унтраана (зөвхөн эхэнд, scroll эхлээгүй үед).
  const [tooSlow, setTooSlow] = useState(false);
  const particles = env.particles && !tooSlow;
  // "auto" = сервер/hydration: CSS (globals.css `.hero-stage`) хөдөлгөөн зөвшөөрөгдсөн үед 3D горимын
  // өндрийг өгч fallback-ыг нууна — 3D хэрэглэгчид далд зураг татахгүй, hydration-д layout үсрэхгүй.
  const mode = env === SERVER_ENV ? "auto" : particles ? "3d" : "static";
  // 3D-г хуудас бүрэн ачаалж, main thread сул болсны дараа эсвэл анхны оролцоонд ачаална.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!particles || armed) return;
    let timer = 0;
    let idle = 0;
    const arm = () => setArmed(true);
    // Эхний ачаалал, hydration-оос хойш main thread-ийг чөлөөтэй үлдээнэ (Safari-д requestIdleCallback байхгүй).
    const onLoad = () => {
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idle = requestIdleCallback(arm, { timeout: 2000 });
        else arm();
      }, ARM_DELAY);
    };
    const events = ["scroll", "pointerdown", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      events.forEach((e) => window.removeEventListener(e, arm));
      window.removeEventListener("load", onLoad);
      clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
    };
  }, [particles, armed]);

  // TODO(Phase 2b): Lenis + ScrollTrigger орж ирэхэд энэ progress-ийг тэндээс авна.
  useEffect(() => {
    const el = sectionRef.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
      const wind = Math.min(1, p / STAGES.windEnd);
      const ui = smoothstep(p, STAGES.ui);
      progressRef.current = p;
      el.style.setProperty("--hero-wind", wind.toFixed(4));
      el.style.setProperty("--hero-ui", ui.toFixed(4));
      el.toggleAttribute("data-past-intro", wind > 0.15);
      // Бүлэг: гарчиг доороос гарч (--in), дараагийн үе ойртоход уусна (--out).
      let chapterVis = 0;
      for (const c of chaptersRef.current?.querySelectorAll<HTMLElement>("[data-chapter]") ?? []) {
        const [a, b] = CHAPTERS[(c as HTMLElement).dataset.chapter as ChapterId];
        const vin = smoothstep(p, [a, a + CHAPTER_FADE]);
        const vout = 1 - smoothstep(p, [b - CHAPTER_FADE, b]);
        (c as HTMLElement).style.setProperty("--in", vin.toFixed(4));
        (c as HTMLElement).style.setProperty("--out", vout.toFixed(4));
        c.toggleAttribute("data-active", vin * vout > 0.5);
        chapterVis = Math.max(chapterVis, vin * vout);
      }
      chaptersRef.current?.style.setProperty("--chapter-fog", chapterVis.toFixed(4));
      swatchesRef.current?.toggleAttribute("inert", ui < 0.5);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [particles]);

  // 3D-гүй үед статик зураг өөрөө hero; loading screen-ийг хүлээлгэхгүй.
  useEffect(() => {
    if (mode === "static") markHeroReady();
  }, [mode]);

  const choose = (s: Swatch) => {
    setSelected(s);
    colorRef.current = s.hex; // даавуу ~1с-д зөөлөн шилжинэ (Story)
  };

  return (
    <>
      <section
        ref={sectionRef}
        data-ready={ready ? "" : undefined}
        data-mode={mode}
        className="hero-stage group relative h-svh"
        style={
          {
            "--hero-svh": `${HERO_SCROLL_SVH}svh`,
            ...(particles && { height: `${HERO_SCROLL_SVH}svh` }),
          } as CSSProperties
        }
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* Scroll эхлэх хүртэл хурц зураг; ширхэгүүд (REVEAL_END = 0.02) орлосны дараа уусна. */}
          <div
            className="absolute inset-0"
            style={
              ready ? { opacity: "clamp(0, (0.04 - var(--hero-wind, 0)) * 40, 1)" } : undefined
            }
          >
            {background}
          </div>
          {particles && armed && (
            <ParticleCanvas
              src={src}
              focusY={focusY}
              clothMaps={clothMaps}
              progressRef={progressRef}
              colorRef={colorRef}
              debug={debug}
              onReady={() => {
                setReady(true);
                markHeroReady();
              }}
              onTooSlow={() => {
                if (progressRef.current < 0.02) setTooSlow(true);
              }}
            />
          )}
          <div
            className="relative isolate flex h-full flex-col items-center justify-center px-5 text-center group-data-past-intro:pointer-events-none"
            style={{
              opacity: "clamp(0, 1 - var(--hero-wind, 0) * 6, 1)",
              transform: "translateY(calc(var(--hero-wind, 0) * -14svh))",
            }}
          >
            {children}
          </div>

          {/* Бүлгийн гарчиг: зүүн доод (утсан дээр голд), нэг дор давхарласан. */}
          {particles && (
            <div
              ref={chaptersRef}
              className="pointer-events-none absolute inset-x-0 bottom-[max(6rem,11svh)] px-5 text-center sm:px-10 md:text-left"
            >
              {/* Ширхэгүүд гарчгийг дарахгүй: текстийн ард зөөлөн цөцгий манан (бүлэг харагдах үед л). */}
              <div
                aria-hidden
                className="absolute -inset-x-0 -top-[22svh] -bottom-[max(6rem,11svh)] bg-[linear-gradient(to_top,rgb(246_241_232/0.94)_0%,rgb(246_241_232/0.82)_45%,rgb(246_241_232/0)_100%)] md:bg-[radial-gradient(70%_100%_at_18%_80%,rgb(246_241_232/0.94)_0%,rgb(246_241_232/0.75)_45%,rgb(246_241_232/0)_100%)]"
                style={{ opacity: "var(--chapter-fog, 0)" }}
              />
              {chapters.map((c) => (
                <div
                  key={c.id}
                  data-chapter={c.id}
                  className="absolute inset-x-5 bottom-0 sm:inset-x-10 md:max-w-xl"
                  style={{ opacity: "var(--out, 0)" }}
                >
                  <p className="text-eyebrow text-camel-deep" style={{ opacity: "var(--in, 0)" }}>
                    {c.eyebrow}
                  </p>
                  {/* Маск: гарчиг доороосоо зөөлөн гарч ирнэ. */}
                  <h2 className="mt-4 overflow-hidden pb-[0.12em] text-title">
                    <span
                      className="block"
                      style={{ transform: "translateY(calc((1 - var(--in, 0)) * 110%))" }}
                    >
                      {c.title}
                    </span>
                  </h2>
                </div>
              ))}
            </div>
          )}

          {/* Даавууны доорх өнгө сонголт (CLOTH_LAYOUT-ийн доод ирмэгээс доош). */}
          {particles && (
            <div
              ref={swatchesRef}
              className="absolute inset-x-0 flex flex-col items-center gap-5 px-5"
              style={{
                top: `calc(${(CLOTH_LAYOUT.centerY + CLOTH_LAYOUT.height / 2) * 100}svh + 1.75rem)`,
                opacity: "var(--hero-ui, 0)",
                transform: "translateY(calc((1 - var(--hero-ui, 0)) * 1rem))",
              }}
            >
              <p className="text-eyebrow text-ink-soft">
                {labels.color}
                <span className="ml-3 text-ink">{selected.name}</span>
              </p>
              <div role="radiogroup" aria-label={labels.color} className="flex gap-3">
                {swatches.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={s.id === selected.id}
                    aria-label={s.name}
                    title={s.name}
                    onClick={() => choose(s)}
                    className="size-9 cursor-pointer rounded-full ring-1 ring-ink/15 ring-offset-3 ring-offset-cream transition-shadow duration-(--duration-slow) ease-silk hover:ring-ink/50 aria-checked:ring-ink"
                    style={{ backgroundColor: s.hex }}
                  />
                ))}
              </div>
              <ButtonLink href={hrefForColor[selected.id]} variant="secondary">
                {labels.view}
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
      <div data-mode={mode} className="hero-fallback" hidden={mode === "3d"}>
        {fallback}
      </div>
    </>
  );
}
