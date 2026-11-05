"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { gearHole, gearOutline } from "@/lib/gear";
import { asset } from "@/lib/asset";

/**
 * Small toys scattered on the page: things to find and poke, all about building and shipping.
 * Each is laid on a join between sections (see Edge) or inside a section, and none carries content
 * a visitor needs, so the decorative ones are hidden from assistive tech.
 */

/** Where a toy sits on its join: side, how far in from that side (vw), and how far below the join (px). */
export type Place = { side: "left" | "right"; at: number; lift?: number };
const placeStyle = ({ side, at, lift = 0 }: Place, size: number) =>
  ({ [side]: `${at}vw`, top: `${lift - size / 2}px`, "--size": `${size}px` }) as React.CSSProperties;

/** A zero-height band laid between two parts of the page; `behind` tucks its toys under the next board. */
export function Edge({ behind, children }: { behind?: boolean; children: React.ReactNode }) {
  return <div className={`seam${behind ? " behind" : ""}`}>{children}</div>;
}

// ───────────── a train of meshing gears: hover to speed it up, click to throw it into reverse

const COLORS = ["#8b9cf2", "#d25fa6", "#a97fdc", "#c9ccda", "#e4405e"];
/** Pitch radius per tooth, px. Meshing gears share it, so their teeth line up. */
const MODULE = 5.2;

type TrainGear = { teeth: number; angle?: number; color?: string };

export function GearTrain({ gears, place, scale = 1 }: { gears: TrainGear[]; place: Place; scale?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  // lay the train out: each gear sits on its neighbour's pitch circle, at the given heading, phased to mesh
  const laid: { x: number; y: number; r: number; n: number; phase: number; dir: number; color: string }[] = [];
  gears.forEach((g, i) => {
    const r = MODULE * g.teeth;
    if (!i) return laid.push({ x: 0, y: 0, r, n: g.teeth, phase: 0, dir: 1, color: g.color ?? COLORS[0] });
    const prev = laid[i - 1];
    const th = ((g.angle ?? 0) * Math.PI) / 180;
    const d = prev.r + r;
    // a tooth of the previous gear pointing along the heading meets a gap of this one
    const phase = th + Math.PI - Math.PI / g.teeth + (prev.n / g.teeth) * (th - prev.phase);
    laid.push({ x: prev.x + Math.cos(th) * d, y: prev.y + Math.sin(th) * d, r, n: g.teeth, phase, dir: -prev.dir, color: g.color ?? COLORS[i % COLORS.length] });
  });
  const pad = MODULE * 2.4;
  const x0 = Math.min(...laid.map((g) => g.x - g.r)) - pad, x1 = Math.max(...laid.map((g) => g.x + g.r)) + pad;
  const y0 = Math.min(...laid.map((g) => g.y - g.r)) - pad, y1 = Math.max(...laid.map((g) => g.y + g.r)) + pad;
  const w = (x1 - x0) * scale, h = (y1 - y0) * scale;

  useEffect(() => {
    const svg = ref.current!;
    const parts = [...svg.querySelectorAll<SVGGElement>("[data-gear]")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let speed = 0.5, target = 0.5, sign = 1, turn = 0, raf = 0, then = performance.now(), on = false;
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    io.observe(svg);
    const hot = () => (target = 2.6);
    const cool = () => (target = 0.5);
    const flip = () => (sign = -sign);
    svg.addEventListener("pointerenter", hot);
    svg.addEventListener("pointerleave", cool);
    svg.addEventListener("click", flip);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      if (!on) return;
      speed += (target * sign - speed) * Math.min(1, dt * 3);
      turn += speed * dt;
      // the first gear sets the pace; each neighbour turns the other way, slower the more teeth it has
      laid.forEach((g, i) => {
        const a = g.phase + g.dir * turn * (laid[0].n / g.n);
        parts[i].setAttribute("transform", `translate(${g.x - x0} ${g.y - y0}) rotate(${((a * 180) / Math.PI).toFixed(2)})`);
      });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      svg.removeEventListener("pointerenter", hot);
      svg.removeEventListener("pointerleave", cool);
      svg.removeEventListener("click", flip);
    };
  });

  return (
    <svg
      ref={ref}
      className="toy train"
      viewBox={`0 0 ${x1 - x0} ${y1 - y0}`}
      width={w}
      height={h}
      style={placeStyle(place, h)}
      aria-hidden="true"
    >
      {laid.map((g, i) => {
        const tip = g.r + MODULE * 1.1, root = (g.r - MODULE * 1.2) / tip;
        const d =
          gearOutline(tip, { teeth: g.n, rTip: 1, rRoot: root, tipHalf: 0.82 / g.n, rootHalf: 1.5 / g.n })
            .map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
            .join(" ") + " Z" + gearHole(0, 0, Math.max(6, g.r * 0.24));
        return (
          <g key={i} data-gear="" transform={`translate(${g.x - x0} ${g.y - y0}) rotate(${(g.phase * 180) / Math.PI})`}>
            <path d={d} fill={g.color} fillRule="evenodd" />
            <circle r={g.r * 0.62} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

// ───────────── Geary pops up on the join and says something when you poke him

export const GEARY_LINES = [
  "Hi, I’m Geary!",
  "Ship it!",
  "What problem are we solving?",
  "Talk to your users.",
  "Psst… type “ship”.",
];

export function GearyPop({ src, place, size, peek, start = 0, flip }: { src: string; place: Place; size: number; peek?: boolean; start?: number; flip?: boolean }) {
  const [said, setSaid] = useState<string | null>(null);
  const [hop, setHop] = useState(0);
  const n = useRef(start);
  const timer = useRef(0);
  const poke = () => {
    setSaid(GEARY_LINES[n.current++ % GEARY_LINES.length]);
    setHop((h) => h + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaid(null), 2600);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className={`toy geary-pop${peek ? " peek" : ""}${flip ? " flip" : ""}`}
      style={placeStyle(place, size)}
      onClick={poke}
      aria-label="Say hi to Geary"
    >
      <img key={hop} src={src} alt="" width={size} height={size} draggable={false} className={hop ? "hop" : undefined} />
      <span className={`bubble${said ? " on" : ""}`} role="status">
        {said}
      </span>
    </button>
  );
}

// ───────────── a little conveyor shipping work from idea to v1.0

const BOXES = ["Idea", "MVP", "Beta", "v1.0"];

export function ShipIt({ place, width = 340 }: { place: Place; width?: number }) {
  return (
    <div className="toy ship" style={{ ...placeStyle(place, 120), width }} aria-hidden="true">
      <div className="ship-boxes">
        {BOXES.map((b, i) => (
          <span key={b} style={{ animationDelay: `${(-i * 10) / BOXES.length}s` }}>
            {b}
          </span>
        ))}
      </div>
      <div className="ship-belt">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <b className="ship-flag">Shipped</b>
    </div>
  );
}

// ───────────── the process, on sticky notes

export function Stickies({ className }: { className?: string }) {
  return (
    <div className={`toy stickies ${className ?? ""}`} aria-hidden="true">
      <span>Idea</span>
      <svg viewBox="0 0 40 20">
        <path d="M2 12 C12 2 26 2 36 10 M30 4 L36 10 L28 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Build</span>
      <svg viewBox="0 0 40 20">
        <path d="M2 8 C12 18 26 18 36 10 M28 7 L36 10 L31 17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Ship</span>
    </div>
  );
}

// ───────────── multiplayer cursors, like a shared design file the whole team is in

const CURSORS = [
  { who: "PM", color: "#d25fa6" },
  { who: "Design", color: "#8b9cf2" },
  { who: "Eng", color: "#a97fdc" },
  { who: "Business", color: "#e4405e" },
];

export function Cursors() {
  return (
    <div className="toy cursors" aria-hidden="true">
      {CURSORS.map((c) => (
        <span key={c.who} style={{ "--c": c.color } as React.CSSProperties}>
          <svg viewBox="0 0 16 16">
            <path d="M2 1.5 L14 8 L8.4 9.3 L5.7 14.5 Z" fill="currentColor" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <b>{c.who}</b>
        </span>
      ))}
    </div>
  );
}

// ───────────── the secret: type "ship" or "geary" anywhere and the page rains boxes and gears

export function EasterEggs() {
  const [burst, setBurst] = useState<{ id: number; bits: { x: number; d: number; s: number; r: number; kind: "gear" | "box" }[] } | null>(null);
  useEffect(() => {
    let typed = "";
    let id = 0;
    let clear = 0;
    const key = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      const word = typed.endsWith("ship") ? "box" : typed.endsWith("geary") ? "gear" : null;
      if (!word || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      typed = "";
      const bits = Array.from({ length: 26 }, () => ({
        x: Math.random() * 100,
        d: Math.random() * 0.8,
        s: 18 + Math.random() * 26,
        r: Math.random() * 720 - 360,
        kind: (Math.random() < 0.75 ? word : word === "box" ? "gear" : "box") as "gear" | "box",
      }));
      setBurst({ id: ++id, bits });
      window.clearTimeout(clear);
      clear = window.setTimeout(() => setBurst(null), 3400);
    };
    window.addEventListener("keydown", key);
    console.info("%c⚙ Geary here. Try typing “ship” or “geary” on the page.", "color:#a97fdc;font-weight:600");
    return () => {
      window.removeEventListener("keydown", key);
      window.clearTimeout(clear);
    };
  }, []);
  if (!burst) return null;
  return (
    <div className="rain" key={burst.id} aria-hidden="true">
      {burst.bits.map((b, i) => (
        <i
          key={i}
          className={b.kind}
          style={{ left: `${b.x}%`, width: b.s, height: b.s, animationDelay: `${b.d}s`, "--r": `${b.r}deg` } as React.CSSProperties}
        >
          {b.kind === "gear" && <img src={asset("/gears/ramp-8.webp")} alt="" />}
        </i>
      ))}
    </div>
  );
}
