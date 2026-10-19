"use client";

import { useEffect, useRef, useState } from "react";

const VOLUME = 0.32;

/**
 * Салхины зөөлөн дуу (CC0, freesound). Default унтраалттай; товч дармагц л файлыг татна.
 * Web Audio buffer-ээр давтана (HTML <audio loop>-ийн завсаргүй), асаах/унтраахад зөөлөн fade.
 * Tab нуугдахад түр зогсоно.
 */
export function WindSound({
  src,
  labels,
}: {
  src: string;
  labels: { label: string; on: string; off: string };
}) {
  const [on, setOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const audio = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  async function ensure() {
    if (audio.current) return audio.current;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const data = await (await fetch(src)).arrayBuffer();
    const buffer = await ctx.decodeAudioData(data);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    audio.current = { ctx, gain };
    return audio.current;
  }

  async function toggle() {
    const next = !on;
    setOn(next);
    try {
      if (next) setLoading(!audio.current);
      const { ctx, gain } = await ensure();
      setLoading(false);
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      if (next) {
        await ctx.resume();
        gain.gain.linearRampToValueAtTime(VOLUME, t + 2.5);
      } else {
        gain.gain.linearRampToValueAtTime(0, t + 1.2);
        window.setTimeout(() => {
          if (gain.gain.value < 0.001) ctx.suspend();
        }, 1300);
      }
    } catch {
      setLoading(false);
      setOn(false);
    }
  }

  useEffect(() => {
    const onVisibility = () => {
      const a = audio.current;
      if (!a || !on) return;
      if (document.hidden) a.ctx.suspend();
      else a.ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [on]);

  useEffect(() => () => void audio.current?.ctx.close(), []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? labels.off : labels.on}
      title={on ? labels.off : labels.on}
      data-on={on ? "" : undefined}
      className="group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-10 cursor-pointer items-center gap-3 rounded-full border border-ink/15 bg-cream/80 px-4 text-eyebrow text-ink-soft backdrop-blur-md transition-colors duration-(--duration-slow) ease-silk hover:border-ink/40 hover:text-ink data-on:text-ink sm:right-6 sm:bottom-6"
    >
      {/* Гурван нимгэн шугам — асаалттай үед салхи мэт аажуу долгионтно. */}
      <span
        aria-hidden
        className={`flex h-3 items-center gap-[3px] ${loading ? "opacity-50" : ""}`}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="wind-bar block h-full w-px origin-center scale-y-[0.3] bg-current"
            style={{ animationDelay: `${i * -0.45}s` }}
          />
        ))}
      </span>
      <span>{labels.label}</span>
    </button>
  );
}
