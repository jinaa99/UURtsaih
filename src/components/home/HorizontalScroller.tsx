"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Хэвтээ scroll. Desktop (≥768px, хөдөлгөөн зөвшөөрөгдсөн): section өндөр = замын урт,
 * дотор нь sticky дэлгэц, босоо scroll → track-ийн хэвтээ шилжилт (ScrollTrigger scrub).
 * Утас / reduced-motion / JS-гүй: энгийн хуруугаар гүйлгэх хэвтээ мөр (scroll-snap).
 */
export function HorizontalScroller({ label, children }: { label: string; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current!;
    const track = trackRef.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      outer.setAttribute("data-pinned", "");
      // Snap-ийн үлдээсэн хэвтээ scroll-ийг арилгана — одоо зөвхөн transform хөдөлгөнө.
      track.parentElement!.scrollLeft = 0;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const setHeight = () => {
        outer.style.height = `${distance() + window.innerHeight}px`;
      };
      setHeight();
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: outer,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          invalidateOnRefresh: true,
          onRefreshInit: setHeight,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: "transform" });
        outer.style.height = "";
        outer.removeAttribute("data-pinned");
      };
    });
    // Фонт ачаалсны дараа өргөн өөрчлөгдөж болно.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return (
    <div ref={outerRef} className="group/h relative">
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="snap-x snap-mandatory scroll-px-5 [scrollbar-width:none] overflow-x-auto overscroll-x-contain group-data-pinned/h:sticky group-data-pinned/h:top-0 group-data-pinned/h:flex group-data-pinned/h:h-svh group-data-pinned/h:snap-none group-data-pinned/h:items-center group-data-pinned/h:overflow-hidden sm:scroll-px-10"
      >
        <div
          ref={trackRef}
          className="flex w-max items-end gap-5 px-5 group-data-pinned/h:will-change-transform sm:gap-8 sm:px-10 md:gap-14 md:pr-[12vw]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
