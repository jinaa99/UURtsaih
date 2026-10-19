"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Хуудасны scroll систем (нүүр, түүх): Lenis (зөөлөн wheel scroll) + GSAP ScrollTrigger нэг ticker дээр.
 * - `[data-reveal]` / `[data-reveal-fade]` → дэлгэцэнд орохоор `data-in` (CSS шилжилт).
 * - `[data-parallax="0.12"]` → эцэг элементийнхээ өндрийн ±12%-иар scroll-оор шилжинэ.
 *   Элемент нь `overflow-hidden` эцэг дотор тэр хэмжээгээр дээш доош илүү том байх ёстой.
 * Reduced-motion үед Lenis, parallax асахгүй; reveal-ууд CSS-ээр шууд харагдана.
 * Drawer (<dialog>) доторх scroll-д Lenis хөндлөнгөөс оролцохгүй.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          reveal.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document
      .querySelectorAll("[data-reveal], [data-reveal-fade]")
      .forEach((el) => reveal.observe(el));

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => reveal.disconnect();

    const lenis = new Lenis({
      lerp: 0.085,
      prevent: (node) => !!node.closest("dialog"),
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const parallax = gsap.utils.toArray<HTMLElement>("[data-parallax]").map((el) => {
      const amount = Number(el.dataset.parallax) || 0.1;
      const shift = () => amount * el.parentElement!.offsetHeight;
      return gsap.fromTo(
        el,
        { y: () => -shift() },
        {
          y: () => shift(),
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    return () => {
      reveal.disconnect();
      parallax.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
