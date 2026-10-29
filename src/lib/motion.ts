"use client";

import { useEffect, useState } from "react";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Map x from [a, b] to [0, 1], clamped. */
export const range = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Progress (0..1) of scrolling through a tall section whose child is sticky. */
export function sectionProgress(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  const total = el.offsetHeight - window.innerHeight;
  return total > 0 ? clamp01(-r.top / total) : 0;
}

export function useMedia(query: string, fallback = false): boolean {
  const [match, setMatch] = useState(fallback);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
