"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import type { HeroScene } from "@/lib/heroScene";
import { LINKS, STATS, UPCOMING } from "@/data/site";
import { useNow } from "@/lib/clock";
import { EYE_SHOTS } from "@/lib/eyeShots";
import { asset } from "@/lib/asset";
import { easeOut } from "@/lib/motion";
import { GEARY_LINES } from "./Playthings";
import { StickerArt } from "./StickerArt";
import { Arrow } from "./icons";

/** All the wide stickers share one width and both round ones another, so they read as a set. */
const WIDE = 0.62, ROUND = 0.42;
/** Stickers around Geary: which file, where (in Geary half-heights from the centre), its width in the same unit, its tilt. */
const STICKERS: { file: string; x: number; y: number; w: number; tilt: number }[] = [
  { file: "heist", x: -0.86, y: -0.74, w: WIDE, tilt: -9 },
  { file: "night", x: 1.08, y: -0.3, w: WIDE, tilt: 8 },
  { file: "sprint", x: -0.92, y: 0.6, w: WIDE, tilt: 6 },
  { file: "jackpot", x: 0.96, y: 0.56, w: ROUND, tilt: -7 },
  { file: "conference", x: 0.34, y: 0.96, w: ROUND, tilt: 6 },
];

/** A sticker to pick up and leave somewhere else. Purely a toy: the real ones, with links, are on the events wall. */
function Sticker({ file, x, y, w, tilt }: (typeof STICKERS)[number]) {
  const held = useRef<{ px: number; py: number } | null>(null);
  const at = useRef({ x: 0, y: 0 });
  const down = (e: React.PointerEvent<HTMLElement>) => {
    held.current = { px: e.clientX - at.current.x, py: e.clientY - at.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add("held");
  };
  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (!held.current) return;
    at.current = { x: e.clientX - held.current.px, y: e.clientY - held.current.py };
    e.currentTarget.style.setProperty("--x", `${at.current.x}px`);
    e.currentTarget.style.setProperty("--y", `${at.current.y}px`);
  };
  const up = (e: React.PointerEvent<HTMLElement>) => {
    held.current = null;
    e.currentTarget.classList.remove("held");
  };
  return (
    <span
      className="hero-sticker"
      aria-hidden="true"
      style={{ "--ox": x, "--oy": y, "--sw": w, "--tilt": `${tilt}deg` } as React.CSSProperties}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <img src={asset(`/stickers/${file}.webp`)} alt="" draggable={false} />
    </span>
  );
}

/** A stat that counts up on arrival. The server sends the real number, so nothing depends on this running. */
function Count({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const [, n, tail] = value.match(/^(\d+)(.*)$/) ?? [];
    if (!n || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const from = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - from) / 1400);
      el.textContent = `${Math.round(easeOut(k) * Number(n))}${tail}`;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);
  return <b ref={ref}>{value}</b>;
}

const short = (ms: number) => {
  const h = Math.floor(ms / 3_600_000);
  return `${Math.floor(h / 24)}d ${h % 24}h ${Math.floor(ms / 60_000) % 60}m`;
};

/** The next event, live: its own component, so the clock's tick doesn't re-render the hero. */
function NextUp() {
  const now = useNow();
  const ev = UPCOMING.find((e) => now === null || Date.parse(e.end) > now);
  if (!ev) return null;
  const ms = now === null ? null : Date.parse(ev.start) - now;
  return (
    <a className="hero-next" href="#upcoming">
      {ev.sticker && (
        <span className="hero-next-art" aria-hidden="true">
          <StickerArt id={ev.sticker} uid="hero-next" />
        </span>
      )}
      <span className="hero-next-text">
        <b>{ev.name}</b>
        <span>{ms !== null && ms <= 0 ? "Happening now" : ms === null ? ev.dates : `Starts in ${short(ms)}`}</span>
      </span>
      <Arrow />
    </a>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const toysRef = useRef<HTMLDivElement>(null);
  const scene = useRef<HeroScene | null>(null);
  const [line, setLine] = useState(0);

  useEffect(() => {
    let alive = true;
    // three.js is by far the page's heaviest script: the copy paints and responds first, the 3D arrives right after
    import("@/lib/heroScene")
      .then(({ createHeroScene }) => {
        if (!alive) return;
        scene.current = createHeroScene({
          section: sectionRef.current!,
          stage: stageRef.current!,
          host: canvasHost.current!,
          portal: portalRef.current!,
          world: worldRef.current!,
          copy: copyRef.current!,
          toys: toysRef.current!,
          onSpin: () => setLine((n) => n + 1),
        });
      })
      .catch(() => sectionRef.current?.classList.add("no-3d")); // no WebGL, or the script failed: a still hero, no dive
    return () => {
      alive = false;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero-stage" ref={stageRef}>
        <div
          className="hero-gear"
          ref={canvasHost}
          tabIndex={0}
          role="img"
          aria-label="Geary, the PMC mascot, in 3D among floating brand gears. Drag or use the arrow keys to turn Geary; press Enter to spin the gear."
        />
        <img className="hero-still" src={asset("/scenery/geary-happy.webp")} alt="" width="426" height="440" />
        <div className="hero-toys" ref={toysRef}>
          {STICKERS.map((s) => (
            <Sticker key={s.file} {...s} />
          ))}
          <button type="button" className="hero-say" onClick={() => scene.current?.spin()}>
            <span key={line}>{line ? GEARY_LINES[(line - 1) % GEARY_LINES.length] : "Hi, I’m Geary! Spin me."}</span>
          </button>
        </div>
        <div className="wrap hero-copy" ref={copyRef}>
          <h1>
            Canada’s Largest <span className="grad">Product Management Club</span>
          </h1>
          <p className="hero-lede">Events, mentorship and industry connections for students curious about product.</p>
          <div className="ctas">
            <a className="btn primary" href={LINKS.member}>
              Become a member <Arrow />
            </a>
            <a className="btn secondary" href={LINKS.volunteer}>
              Volunteer with us
            </a>
          </div>
          <ul className="hero-stats">
            {STATS.map((s) => (
              <li key={s.label}>
                <Count value={s.n} />
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
          <NextUp />
        </div>
        <div className="portal" ref={portalRef} aria-hidden="true">
          <div className="portal-world" ref={worldRef}>
            <picture>
              {EYE_SHOTS.slice(0, -1).map((s) => (
                <source key={s.src} media={s.media} srcSet={s.src} />
              ))}
              <img src={EYE_SHOTS[EYE_SHOTS.length - 1].src} alt="" decoding="async" draggable={false} />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
