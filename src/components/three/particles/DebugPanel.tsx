"use client";

import { folder, Leva, monitor, useControls } from "leva";
import { defaultSettings as d, type ParticleSettings } from "./settings";

const COUNTS = {
  "10,000": 10_000,
  "30,000 (сул утас)": 30_000,
  "60,000": 60_000,
  "100,000 (үндсэн)": 100_000,
  "150,000": 150_000,
  "250,000": 250_000,
};

type OnSetting = <K extends keyof ParticleSettings>(key: K, value: ParticleSettings[K]) => void;

/** `?debug` — тохиргоог амьдаар өөрчилнө. Утгууд дахин render хийлгүй ref-д шууд орно. */
export default function DebugPanel({
  count,
  onCount,
  onSetting,
  getFps,
}: {
  count: number;
  onCount: (count: number) => void;
  onSetting: OnSetting;
  getFps: () => number;
}) {
  const num = (key: keyof ParticleSettings, min: number, max: number, step: number) => ({
    value: d[key] as number,
    min,
    max,
    step,
    onChange: (v: number) => onSetting(key, v),
  });

  useControls({
    fps: monitor(getFps, { graph: true, interval: 200 }),
    particles: {
      value: count,
      options: COUNTS,
      onChange: (v: number, _path: string, ctx: { initial: boolean }) => {
        if (!ctx.initial) onCount(v);
      },
    },
    progress: { ...num("progressOverride", -1, 1, 0.01), label: "progress (−1 = scroll)" },
    Салхи: folder({
      turbulence: num("turbulence", 0, 600, 5),
      drift: num("drift", 0, 2, 0.01),
      curlScale: num("curlScale", 0.2, 6, 0.05),
      pointerStrength: num("pointerStrength", 0, 8000, 50),
      pointerRadius: num("pointerRadius", 20, 400, 5),
    }),
    Өнгө: folder({
      tint: { value: d.tint, onChange: (v: string) => onSetting("tint", v) },
      tintMix: num("tintMix", 0, 1, 0.01),
      fiberAlpha: num("fiberAlpha", 0.05, 1, 0.01),
      fiberSize: num("fiberSize", 0.5, 6, 0.05),
    }),
  });

  return <Leva titleBar={{ title: "ÜÜR particles", position: { x: 0, y: 88 } }} />;
}
