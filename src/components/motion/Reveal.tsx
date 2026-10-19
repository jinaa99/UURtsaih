import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Гарчиг/мөрийг маскан дотроос доороос нь зөөлөн гаргана (SmoothScroll → `data-in`).
 * JS-гүй эсвэл reduced-motion үед шууд харагдана (globals.css).
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  id,
  children,
}: {
  as?: ElementType;
  /** ms */
  delay?: number;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      data-reveal=""
      className={`overflow-hidden pb-[0.12em] ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      <span className="reveal-line block">{children}</span>
    </Tag>
  );
}
