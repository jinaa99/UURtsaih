"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { TextureLoader, type PerspectiveCamera } from "three";
import { ParticleSystem } from "./ParticleSystem";
import { PointerWind } from "./PointerWind";
import type { ParticleSettings } from "./settings";
import { fitCamera, type Story } from "./story";

const WARMUP = 1.5; // сек — shader compile, зураг decode
const SAMPLE = 2;

export function ParticleField({
  src,
  count,
  focusY,
  progressRef,
  colorRef,
  story,
  settingsRef,
  fpsRef,
  onReady,
  onSlow,
  minFps = 48,
  onNearCloth,
}: {
  src: string;
  count: number;
  focusY: number;
  progressRef: RefObject<number>;
  /** Сонгосон даавууны өнгө (hex). */
  colorRef: RefObject<string>;
  story: Story;
  settingsRef: RefObject<ParticleSettings>;
  fpsRef: RefObject<number>;
  onReady: () => void;
  /** Байвал: эхний секундүүдэд `minFps` хүрэхгүй бол нэг удаа дуудна. */
  onSlow?: () => void;
  minFps?: number;
  /** Утасны үе эхлэхэд нэг удаа — даавууны текстурыг урьдчилан татахад. */
  onNearCloth: () => void;
}) {
  const gl = useThree((s) => s.gl);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const image = useLoader(TextureLoader, src);

  // Сүлжээг зөвхөн харьцаа мэдэгдэхүйц өөрчлөгдөхөд (эргүүлэх г.м.) дахин үүсгэнэ.
  const aspectBucket = Math.round(Math.log(width / height) * 4);
  const system = useMemo(
    () => new ParticleSystem(gl, { count, aspect: Math.exp(aspectBucket / 4), image, focusY }),
    [gl, count, aspectBucket, image, focusY],
  );
  useEffect(() => () => system.dispose(), [system]);

  const pointer = useMemo(() => new PointerWind(), []);
  useEffect(() => {
    pointer.attach();
    return () => pointer.detach();
  }, [pointer]);

  const stats = useRef({
    frames: 0,
    elapsed: 0,
    sampleFrames: 0,
    sampleTime: 0,
    done: false,
    nearCloth: false,
  });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const settings = settingsRef.current;
    const progress =
      settings.progressOverride >= 0 ? settings.progressOverride : progressRef.current;

    const size = state.size;
    story.update(delta, progress, size.width, size.height, colorRef.current);
    const camDist = fitCamera(state.camera as PerspectiveCamera, size.height);

    system.update({
      delta,
      story,
      width: size.width,
      height: size.height,
      dpr: state.viewport.dpr,
      camDist,
      pointer: pointer.sample(delta, gl.domElement.getBoundingClientRect()),
      settings,
    });

    const st = stats.current;
    if (++st.frames === 3) onReady();
    if (!st.nearCloth && story.gather > 0) {
      st.nearCloth = true;
      onNearCloth();
    }
    fpsRef.current += (1 / Math.max(rawDelta, 1e-3) - fpsRef.current) * 0.1;

    // FPS хамгаалалт: tab солих мэт урт завсарлагааг тооцохгүй.
    if (onSlow && !st.done && rawDelta < 0.25) {
      st.elapsed += rawDelta;
      if (st.elapsed > WARMUP) {
        st.sampleFrames++;
        st.sampleTime += rawDelta;
        if (st.sampleTime >= SAMPLE) {
          st.done = true;
          if (st.sampleFrames / st.sampleTime < minFps) onSlow();
        }
      }
    }
  });

  return <primitive object={system.points} />;
}
