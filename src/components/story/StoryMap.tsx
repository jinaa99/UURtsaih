"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { mongoliaMap } from "@/content/mongolia-map";

gsap.registerPlugin(ScrollTrigger);

export type JourneyStop = {
  id: "gobi" | "mid" | "factory";
  /** Газрын зураг дээрх нэр. */
  place: string;
  eyebrow: string;
  title: string;
  body: string;
};

const { width, height, d, points } = mongoliaMap;

/** Говь → тал → үйлдвэр: цэгүүдийн дундуур Catmull-Rom → cubic Bézier, бага зэрэг нугаралттай. */
const route = (() => {
  const [g, m, f] = [points.gobi, points.mid, points.factory];
  const pts: [number, number][] = [
    [g[0], g[1]],
    [g[0] + 46, g[1] - 44],
    [m[0], m[1]],
    [m[0] + 34, m[1] - 52],
    [f[0], f[1]],
  ];
  let path = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const [p1, p2] = [pts[i], pts[i + 1]];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    path += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return path;
})();

/** Шугам зурагдах progress-ийн хүрээ (section-ий scroll 0..1 дотор). */
const DRAW: [number, number] = [0.06, 0.88];

/**
 * Монголын газрын зураг дээр говиос үйлдвэр хүртэл гэрлийн шугам scroll-оор татагдана.
 * Хөдөлгөөн зөвшөөрөгдсөн үед: section ~320svh, дотор нь sticky дэлгэц; зогсоол бүрт
 * тайлбар доороос гарч ирнэ. JS-гүй / reduced-motion: шугам бүтэн, тайлбарууд жагсаалтаар.
 */
export function StoryMap({ stops, label }: { stops: readonly JourneyStop[]; label: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const coreRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const stopRefs = useRef<Record<string, SVGGElement | null>>({});
  const captionsRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const outer = outerRef.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      outer.setAttribute("data-pinned", "");
      const routes = [glowRef.current!, coreRef.current!];
      const [first] = routes;
      const len = first.getTotalLength();
      // Зогсоол бүр шугамын хэдэн хувьд байгааг тооцно.
      const at = Object.fromEntries(
        stops.map((s) => {
          const [x, y] = points[s.id];
          let best = 0;
          let bestDist = Infinity;
          for (let i = 0; i <= 200; i++) {
            const p = first.getPointAtLength((len * i) / 200);
            const dist = Math.hypot(p.x - x, p.y - y);
            if (dist < bestDist) [best, bestDist] = [i / 200, dist];
          }
          return [s.id, best];
        }),
      );
      routes.forEach((p) => (p.style.strokeDasharray = `${len} ${len}`));

      const state = { p: 0 };
      const render = () => {
        const t = Math.min(1, Math.max(0, (state.p - DRAW[0]) / (DRAW[1] - DRAW[0])));
        routes.forEach((p) => (p.style.strokeDashoffset = `${len * (1 - t)}`));
        const head = first.getPointAtLength(len * t);
        headRef.current?.setAttribute("transform", `translate(${head.x} ${head.y})`);
        headRef.current?.style.setProperty("opacity", t > 0 && t < 1 ? "1" : "0");
        let active = 0;
        stops.forEach((s, i) => {
          const lit = t >= at[s.id] - 0.02;
          stopRefs.current[s.id]?.toggleAttribute("data-lit", lit);
          if (lit) active = i;
        });
        captionsRef.current?.querySelectorAll("li").forEach((li, i) => {
          li.toggleAttribute("data-active", i === active);
        });
      };
      render();
      const tween = gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: render,
        scrollTrigger: { trigger: outer, start: "top top", end: "bottom bottom", scrub: 1.1 },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        outer.removeAttribute("data-pinned");
        routes.forEach((p) => {
          p.style.strokeDasharray = "";
          p.style.strokeDashoffset = "";
        });
        Object.values(stopRefs.current).forEach((g) => g?.setAttribute("data-lit", ""));
      };
    });
    return () => mm.revert();
  }, [stops]);

  return (
    <div ref={outerRef} className="group/map relative data-pinned:h-[320svh]">
      <div className="mx-auto grid max-w-screen-2xl items-center gap-10 px-5 py-24 group-data-pinned/map:sticky group-data-pinned/map:top-0 group-data-pinned/map:h-svh group-data-pinned/map:content-center group-data-pinned/map:py-0 sm:px-10 md:grid-cols-12">
        <svg
          viewBox={`-20 -20 ${width + 40} ${height + 40}`}
          role="img"
          aria-label={label}
          // Утсан дээр өндрийг тогтоож хажуугаас нь тайрна — зам (голд) томорч харагдана.
          preserveAspectRatio="xMidYMid slice"
          className="h-[44svh] w-full md:col-span-8 md:-ml-6 md:h-auto"
        >
          <defs>
            <clipPath id="mn-clip">
              <path d={d} />
            </clipPath>
            <pattern id="mn-dots" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="var(--color-camel-deep)" opacity="0.28" />
            </pattern>
            <radialGradient
              id="mn-gobi"
              cx={points.gobi[0]}
              cy={points.gobi[1] + 20}
              r="330"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="var(--color-camel)" stopOpacity="0.38" />
              <stop offset="1" stopColor="var(--color-camel)" stopOpacity="0" />
            </radialGradient>
            <filter id="mn-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <path d={d} fill="var(--color-cream-deep)" />
          <g clipPath="url(#mn-clip)">
            <rect x="0" y="0" width={width} height={height} fill="url(#mn-gobi)" />
            <rect x="0" y="0" width={width} height={height} fill="url(#mn-dots)" />
          </g>
          <path
            d={d}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />

          {/* Зам: бүдэг тасархай суурь + гэрэлтэх шугам (glow + цайвар гол). */}
          <path
            d={route}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity="0.22"
            strokeWidth="1.2"
            strokeDasharray="2 6"
          />
          <path
            ref={glowRef}
            d={route}
            fill="none"
            stroke="var(--color-camel)"
            strokeWidth="9"
            strokeLinecap="round"
            filter="url(#mn-glow)"
            opacity="0.85"
          />
          <path
            ref={coreRef}
            d={route}
            fill="none"
            stroke="#fff8ea"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {stops.map((s) => {
            const [x, y] = points[s.id];
            const right = s.id !== "gobi";
            return (
              <g
                key={s.id}
                ref={(el) => {
                  stopRefs.current[s.id] = el;
                }}
                data-lit=""
                className="group/stop"
              >
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill="var(--color-camel)"
                  filter="url(#mn-glow)"
                  className="opacity-0 transition-opacity duration-(--duration-slower) group-data-lit/stop:opacity-70"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="var(--color-cream)"
                  stroke="var(--color-ink)"
                  strokeWidth="1.2"
                  className="transition-[fill] duration-(--duration-slower) group-data-lit/stop:fill-[#fff8ea]"
                />
                {s.id !== "mid" && (
                  <text
                    x={right ? x + 18 : x - 18}
                    y={y + 7}
                    textAnchor={right ? "start" : "end"}
                    className="fill-ink font-serif text-[22px] opacity-40 transition-opacity duration-(--duration-slower) group-data-lit/stop:opacity-100"
                  >
                    {s.place}
                  </text>
                )}
              </g>
            );
          })}

          <g ref={headRef} style={{ opacity: 0 }} className="transition-opacity duration-500">
            <circle r="22" fill="#fff3dc" filter="url(#mn-glow)" />
            <circle r="4.5" fill="#fffaf0" />
          </g>
        </svg>

        {/* Тайлбар: pinned үед нэг дор давхарлаж, идэвхтэй нь доороос гарч ирнэ. */}
        <ol
          ref={captionsRef}
          className="grid gap-10 group-data-pinned/map:relative group-data-pinned/map:min-h-56 group-data-pinned/map:gap-0 md:col-span-4"
        >
          {stops.map((s) => (
            <li
              key={s.id}
              className="group/cap transition-opacity duration-(--duration-slower) ease-silk group-data-pinned/map:pointer-events-none group-data-pinned/map:absolute group-data-pinned/map:inset-x-0 group-data-pinned/map:top-0 group-data-pinned/map:opacity-0 group-data-pinned/map:data-active:pointer-events-auto group-data-pinned/map:data-active:opacity-100"
            >
              <p className="text-eyebrow text-camel-deep">{s.eyebrow}</p>
              <h2 className="mt-4 overflow-hidden pb-[0.12em] text-heading sm:text-title">
                <span className="block transition-transform duration-(--duration-slower) ease-silk group-data-pinned/map:translate-y-[110%] group-data-pinned/map:group-data-active/cap:translate-y-0">
                  {s.title}
                </span>
              </h2>
              <p className="mt-4 max-w-sm text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
