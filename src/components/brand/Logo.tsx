import { logoMark, logoWord } from "./logo-data";

/**
 * ÜÜR лого — "нэхмэл үүр": тэнгэрийн хаяа дээр мандах нар, дотроо нэхмэлийн эгнээ
 * (үүр цайх → утас → нэхмэл), Cormorant Garamond wordmark-тай. Өгөгдөл: scripts/brand/build-logo.mjs.
 *
 * Өнгө: wordmark ба тэнгэрийн хаяа = `currentColor`, нар = `--logo-accent` (default camel-deep).
 * Хэмжээ: өндрөөр (`className="h-5"` г.м.), өргөн нь харьцаагаараа.
 */

const { crop } = logoMark;

export function LogoMark({
  className = "",
  strokeScale = 1,
  animated = false,
}: {
  className?: string;
  /** Жижиг хэмжээнд шугамыг зузаатгана. */
  strokeScale?: number;
  /** Loader: нар ба эгнээ ар араасаа зурагдана (globals.css `.logo-draw`). */
  animated?: boolean;
}) {
  const accent = "var(--logo-accent, var(--color-camel-deep))";
  return (
    <svg
      aria-hidden
      viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`}
      overflow="visible"
      className={`${animated ? "logo-draw" : ""} ${className}`}
      fill="none"
    >
      <path d={logoMark.sun} stroke={accent} strokeWidth={1.4 * strokeScale} pathLength={1} />
      {logoMark.rows.map((d) => (
        <path key={d} d={d} stroke={accent} strokeWidth={1.1 * strokeScale} pathLength={1} />
      ))}
      <path
        d={logoMark.horizon}
        stroke="currentColor"
        strokeWidth={1.4 * strokeScale}
        pathLength={1}
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={logoWord.viewBox} className={className} fill="currentColor">
      <path d={logoWord.d} />
    </svg>
  );
}

/**
 * Хэвтээ (header) эсвэл босоо (footer, loader) хувилбар.
 * Хэвтээд тэмдгийн тэнгэрийн хаяа wordmark-ийн суурь шугамтай таарна.
 */
export function Logo({
  variant = "horizontal",
  className = "",
  label = "ÜÜR",
  animated = false,
}: {
  variant?: "horizontal" | "stacked";
  className?: string;
  label?: string;
  animated?: boolean;
}) {
  if (variant === "stacked") {
    return (
      <span
        role="img"
        aria-label={label}
        className={`inline-flex flex-col items-center ${className}`}
      >
        <LogoMark className="h-[0.42em] w-auto" animated={animated} />
        <Wordmark className="mt-[0.34em] h-[0.62em] w-auto" />
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex items-end gap-[0.42em] ${className}`}
    >
      {/* Тэмдэг суурь шугам дээр: wordmark-ийн доод ирмэг ≈ суурь шугам. */}
      <LogoMark className="mb-[0.02em] h-[0.56em] w-auto" strokeScale={1.05} animated={animated} />
      <Wordmark className="h-[1em] w-auto" />
    </span>
  );
}
