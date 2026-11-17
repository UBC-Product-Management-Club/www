"use client";

import { useEffect, useRef } from "react";

// the PMC poster ramp, periwinkle → rose, walked along as the trail is drawn
const RAMP = ["#8b9cf2", "#a97fdc", "#d25fa6", "#e4405e"];
const GRID = 10; // blocks snap to a pixel grid so the trail reads as blocks, not smoke
const SIZE = 9;
const LIFE = 520; // ms

type Block = { x: number; y: number; born: number; color: string };

// a trail of grid-snapped blocks behind the (CSS) purple cursor; only for a mouse, and never with reduced motion
export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const blocks: Block[] = [];
    const seen = new Set<string>();
    let step = 0;
    let frame = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = (now: number) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        const t = (now - b.born) / LIFE;
        if (t >= 1) {
          seen.delete(`${b.x},${b.y}`);
          blocks.splice(i, 1);
          continue;
        }
        const s = SIZE * (1 - t * t);
        ctx.globalAlpha = 0.85 * (1 - t);
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x - s / 2, b.y - s / 2, s, s, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = blocks.length ? requestAnimationFrame(draw) : 0;
    };

    let last: { x: number; y: number } | null = null;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const now = performance.now();
      // fill the gap between events so a fast flick still leaves a continuous line of blocks
      const from = last ?? { x: e.clientX, y: e.clientY };
      const dist = Math.hypot(e.clientX - from.x, e.clientY - from.y);
      const n = Math.max(1, Math.ceil(dist / GRID));
      for (let i = 1; i <= n; i++) {
        const x = Math.round((from.x + ((e.clientX - from.x) * i) / n) / GRID) * GRID;
        const y = Math.round((from.y + ((e.clientY - from.y) * i) / n) / GRID) * GRID;
        const key = `${x},${y}`;
        if (seen.has(key)) continue;
        seen.add(key);
        blocks.push({ x, y, born: now, color: RAMP[Math.floor(step++ / 3) % RAMP.length] });
      }
      last = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const leave = () => (last = null);

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="cursor-trail" aria-hidden="true" />;
}
