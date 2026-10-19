import type { CSSProperties, ReactNode } from "react";

export type StepId = "comb" | "clean" | "spin" | "knit";

/** Нимгэн шугаман дүрс — дэлгэцэнд орохоор зурагдана (globals.css: `.draw`). */
const icons: Record<StepId, ReactNode> = {
  // Сам ба түүгээр татагдах ширхэг.
  comb: (
    <>
      <path d="M8 14h32" />
      <path d="M12 14v10M17 14v10M22 14v10M27 14v10M32 14v10M37 14v10" />
      <path d="M6 34c6-4 10 4 16 0s10 4 20 0" />
      <path d="M6 40c6-3 12 3 18 0s12 3 18 0" />
    </>
  ),
  // Сэгсгэр хөвөн → тэгш ширхэг.
  clean: (
    <>
      <path d="M6 16c3-5 6 5 9 0s6 5 9 0" />
      <path d="M6 24c3-4 6 4 9 0s6 4 9 0" />
      <path d="M28 20h4M34 20h2" />
      <path d="M30 13h12M30 20h12M30 27h12" />
      <circle cx="12" cy="36" r="1.2" />
      <circle cx="20" cy="40" r="1.2" />
    </>
  ),
  // Ээрүүл: тэнхлэг, ороосон утас.
  spin: (
    <>
      <path d="M24 4v40" />
      <path d="M14 34h20" />
      <path d="M17 16c4-2 10-2 14 0M16 21c5-2 11-2 16 0M17 26c4-2 10-2 14 0" />
      <path d="M31 16c5-3 9-1 11 3" />
    </>
  ),
  // Нэхмэлийн V гогцоонууд, хоёр эгнээ.
  knit: (
    <>
      <path d="M6 12l6 8 6-8 6 8 6-8 6 8 6-8" />
      <path d="M6 22l6 8 6-8 6 8 6-8 6 8 6-8" />
      <path d="M6 32l6 8 6-8 6 8 6-8 6 8 6-8" />
    </>
  ),
};

/** Ноолуур хэрхэн бий болдог: самнах → цэвэрлэх → ээрэх → нэхэх. */
export function ProcessSteps({
  steps,
}: {
  steps: readonly { id: StepId; title: string; body: string }[];
}) {
  return (
    <ol className="relative grid gap-14 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-12">
      {/* Алхмуудыг холбох нимгэн шугам (desktop), зүүнээс баруун тийш татагдана. */}
      <div
        aria-hidden
        data-reveal-fade
        className="draw-line absolute top-7 right-0 left-0 hidden h-px bg-ink/15 lg:block"
      />
      {steps.map((s, i) => (
        <li
          key={s.id}
          data-reveal-fade
          className="relative"
          style={{ "--reveal-delay": `${i * 180}ms` } as CSSProperties}
        >
          <div className="relative flex size-14 items-center justify-center rounded-full bg-cream ring-1 ring-ink/15">
            <svg
              aria-hidden
              viewBox="0 0 48 48"
              className="draw size-8 text-camel-deep"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icons[s.id]}
            </svg>
          </div>
          <p className="mt-8 text-eyebrow text-ink-soft tabular-nums">0{i + 1}</p>
          <h3 className="mt-3 text-heading">{s.title}</h3>
          <p className="mt-4 max-w-xs text-ink-soft">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
