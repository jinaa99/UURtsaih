"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { ClothField } from "./ClothField";
import { ParticleField } from "./ParticleField";
import { defaultSettings, detectTier, PARTICLE_COUNT, type ParticleSettings } from "./settings";
import { Story } from "./story";

// leva зөвхөн ?debug үед татагдана.
const DebugPanel = dynamic(() => import("./DebugPanel"), { ssr: false });

/** next/dynamic({ ssr: false })-ээр л ачаална (WebGL, window). */
export default function ParticleCanvas({
  src,
  focusY,
  clothMaps,
  progressRef,
  colorRef,
  debug,
  onReady,
  onTooSlow,
}: {
  src: string;
  focusY: number;
  /** Poly Haven даавууны normal / roughness (1024px). */
  clothMaps: { normal: string; roughness: string };
  progressRef: RefObject<number>;
  colorRef: RefObject<string>;
  debug: boolean;
  onReady: () => void;
  /** Сул түвшинд (30k) ч MIN_FPS хүрэхгүй бол — 3D-г орхиж зурагтай хувилбар руу. */
  onTooSlow: () => void;
}) {
  const [tier] = useState(detectTier);
  const [count, setCount] = useState<number>(PARTICLE_COUNT[tier]);
  const [story] = useState(() => new Story());
  const [clothWanted, setClothWanted] = useState(false);
  const settingsRef = useRef<ParticleSettings>({ ...defaultSettings });
  const fpsRef = useRef(60);

  // Дэлгэцээс гарсан үед GPU-г бүрэн амраана.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrapRef.current!);
    return () => io.disconnect();
  }, []);

  // Debug-д тоог гараар удирдана; бусад үед удаан бол сул түвшин рүү, тэнд ч удаан бол 3D-гүй болгоно.
  const onSlow = debug
    ? undefined
    : count > PARTICLE_COUNT.low
      ? () => setCount(PARTICLE_COUNT.low)
      : onTooSlow;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      data-count={count}
      className="pointer-events-none absolute inset-0"
    >
      {/* Perspective: z = 0 хавтгайд 1 нэгж = 1 CSS px (fitCamera). Tone mapping-гүй — өнгө swatch-тэй таарна. */}
      <Canvas
        flat
        camera={{ fov: 35, near: 10, far: 20000, position: [0, 0, 1500] }}
        dpr={[1, tier === "low" ? 1.5 : 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible ? "always" : "never"}
      >
        <Suspense fallback={null}>
          <ParticleField
            key={count}
            src={src}
            count={count}
            focusY={focusY}
            progressRef={progressRef}
            colorRef={colorRef}
            story={story}
            settingsRef={settingsRef}
            fpsRef={fpsRef}
            onReady={() => {
              onReady();
              // Даавууны текстур, shader-ийг урьдчилан бэлдэнэ (утасны үе эхлэхээс өмнө).
              if ("requestIdleCallback" in window)
                requestIdleCallback(() => setClothWanted(true), { timeout: 3000 });
              else setTimeout(() => setClothWanted(true), 1500);
            }}
            onSlow={onSlow}
            minFps={count > PARTICLE_COUNT.low ? 48 : 30}
            onNearCloth={() => setClothWanted(true)}
          />
        </Suspense>
        {clothWanted && (
          <Suspense fallback={null}>
            <ClothField
              story={story}
              normalSrc={clothMaps.normal}
              roughnessSrc={clothMaps.roughness}
            />
          </Suspense>
        )}
      </Canvas>
      {debug && (
        <DebugPanel
          count={count}
          onCount={setCount}
          onSetting={(key, value) => {
            settingsRef.current[key] = value;
          }}
          getFps={() => fpsRef.current}
        />
      )}
    </div>
  );
}
