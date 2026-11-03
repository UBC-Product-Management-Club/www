"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { PHOTOS, TEAM, type Member } from "@/data/site";
import { gearPath } from "@/lib/gear";
import { useMedia } from "@/lib/motion";
import { Arrow, ArrowLeft, Pause, Play } from "./icons";

/** Each set of three shows for HOLD ms, then cross-fades over 2 × FADE ms. */
const HOLD = 3000;
const FADE = 500;
const SETS: Member[][] = Array.from({ length: Math.ceil(TEAM.length / 3) }, (_, i) => TEAM.slice(i * 3, i * 3 + 3));
/** The three strands off the ring: fan angle (deg), depth (px) and chain links. The middle one hangs in front, the outer two longer and wider. */
const STRANDS = [
  { angle: 40, z: -46, links: 12 },
  { angle: 0, z: 34, links: 7 },
  { angle: -40, z: -46, links: 13 },
];
const LINK = 17; // px of chain per link
/** The keychain's resting pose (deg), and how far a drag can twist it either way. */
const HOME = { ry: -12, rx: 6 };
const TWIST = 38;
const CHARM = gearPath(100, 100, 96);
const initials = (n: string) => n.split(/[\s-]+/).map((w) => w[0]).join("").slice(0, 2);
const first = (n: string) => n.split(" ")[0];
const tiersOf = (set: Member[]) => [...new Set(set.map((m) => m.tier))].join(" · ");

function Badge({ m }: { m: Member }) {
  return m.emoji ? (
    <span className="kc-emoji" role="img" aria-label={`${first(m.name)}’s emoji`}>
      {m.emoji}
    </span>
  ) : (
    <span className="kc-emoji none" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <path d={CHARM} />
        <circle cx="100" cy="100" r="30" />
      </svg>
    </span>
  );
}

function Card({ m }: { m: Member }) {
  return (
    <div className="kc-card">
      <div className="kc-face front">
        <i className="kc-eyelet" aria-hidden="true" />
        <span className="kc-photo">
          {m.photo ? <img src={m.photo} alt="" draggable={false} /> : <span>{initials(m.name)}</span>}
        </span>
        <span className="kc-name">{m.name}</span>
        <span className="kc-role">{m.role}</span>
        <Badge m={m} />
        <i className="kc-sheen" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function Team() {
  const [set, setSet] = useState(0);
  const [out, setOut] = useState(false);
  const [chosen, setPlaying] = useState(true);
  // no autoplay for reduced motion; the arrows and the indicator still change sets
  const reduced = useMedia("(prefers-reduced-motion: reduce)", true);
  const playing = chosen && !reduced;
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const live = useRef({ set: 0, busy: false, hold: 0, paused: false, playing: true });

  /** Fade the current three out, swap in set k, fade them back in. */
  const go = (k: number) => {
    const L = live.current;
    const next = (k + SETS.length) % SETS.length;
    if (L.busy || next === L.set) return;
    L.busy = true;
    L.hold = 0;
    setOut(true);
    window.setTimeout(() => {
      L.set = next;
      setSet(next);
      requestAnimationFrame(() => {
        setOut(false);
        window.setTimeout(() => (L.busy = false), FADE);
      });
    }, FADE);
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
    live.current.playing = playing;
  });

  useEffect(() => {
    const stage = stageRef.current!;
    const rig = rigRef.current!;
    const dots = dotsRef.current!;
    const strands = [...rig.querySelectorAll<HTMLElement>(".kc-strand")];
    const hangs = [...rig.querySelectorAll<HTMLElement>(".kc-hang")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const L = live.current;

    // the keychain is a little physics toy: an anchor on a spring, a turn with inertia, three pendulums
    const s = {
      x: 0, y: 0, vx: 0, vy: 0, ax: 0, lastX: 0,
      ry: HOME.ry, vry: 0, rx: HOME.rx, vrx: 0,
      th: [0.06, -0.04, 0.08], vth: [0, 0, 0],
      ps: [0, 0, 0], vps: [0, 0, 0],
    };
    let drag: { mode: "ring" | "turn"; px: number; py: number; ox: number; oy: number; moved: number } | null = null;
    let suppress = false;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const ring = !!(e.target as HTMLElement).closest("[data-ring]");
      drag = { mode: ring ? "ring" : "turn", px: e.clientX, py: e.clientY, ox: s.x, oy: s.y, moved: 0 };
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {} // a pointer that already ended can't be captured; the drag still works without it
      stage.classList.add("grabbing");
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
      if (drag.mode === "ring") {
        const w = stage.clientWidth * 0.36;
        s.x = Math.max(-w, Math.min(w, drag.ox + dx));
        s.y = Math.max(-60, Math.min(140, drag.oy + dy));
        drag.moved = Math.hypot(dx, dy);
      } else {
        // rubber-banded: the further it twists, the harder it pulls back, so a card never turns edge-on
        const pull = 1 - Math.min(0.85, Math.abs(s.ry - HOME.ry) / TWIST);
        const d = (e.movementX || 0) * 0.35 * pull;
        s.vry = d * 60; // deg/s, handed to the spring on release
        s.ry = Math.max(HOME.ry - TWIST, Math.min(HOME.ry + TWIST, s.ry + d));
        s.rx = Math.max(-14, Math.min(20, s.rx - (e.movementY || 0) * 0.12));
        drag.moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
      }
    };
    const up = () => {
      if (drag && drag.moved > 6) suppress = true; // a drag is not a click
      drag = null;
      stage.classList.remove("grabbing");
    };
    const click = (e: MouseEvent) => {
      if (!suppress) return;
      e.preventDefault();
      e.stopPropagation();
      suppress = false;
    };
    const key = (e: KeyboardEvent) => {
      if (e.target !== stage) return;
      if (e.key === "ArrowLeft") s.vry -= 120;
      else if (e.key === "ArrowRight") s.vry += 120;
      else return;
      e.preventDefault();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("click", click, true);
    stage.addEventListener("keydown", key);

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "60px" });
    io.observe(stage);
    // narrow stages fan the strands less, so all three polaroids stay on screen
    let fan = 1;
    const ro = new ResizeObserver(() => (fan = Math.max(0.45, Math.min(1, stage.clientWidth / 600))));
    ro.observe(stage);

    let raf = 0, then = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - then) / 1000);
      then = now;
      if (!visible || document.hidden) return;

      // anchor: follows the hand while the ring is held, then springs home
      const pvx = s.vx;
      if (drag?.mode === "ring") {
        s.vx = (s.x - s.lastX) / dt;
      } else {
        s.vx += (-26 * s.x - 7 * s.vx) * dt;
        s.vy += (-26 * s.y - 7 * s.vy) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      s.lastX = s.x;
      s.ax = (s.vx - pvx) / dt;

      // turn: a damped spring back to facing you, so a let-go keychain sways to rest instead of snapping
      if (drag?.mode !== "turn") {
        s.vry += (-(s.ry - HOME.ry) * 30 - s.vry * 7) * dt;
        s.ry = Math.max(HOME.ry - TWIST, Math.min(HOME.ry + TWIST, s.ry + s.vry * dt));
        s.vrx += (-(s.rx - HOME.rx) * 30 - s.vrx * 7) * dt;
        s.rx += s.vrx * dt;
      }

      // pendulums: the anchor's sideways jolt swings them, the turn tips them, a breeze keeps them alive
      for (let i = 0; i < 3; i++) {
        const breeze = reduce ? 0 : Math.sin(now / 900 + i * 2.1) * 0.35;
        s.vth[i] += (-8 * s.th[i] - 0.9 * s.vth[i] - s.ax / 420 + breeze) * dt;
        s.th[i] = Math.max(-0.9, Math.min(0.9, s.th[i] + s.vth[i] * dt));
        s.vps[i] += (-9 * s.ps[i] - 1.1 * s.vps[i] - s.vry * 0.001 + (reduce ? 0 : Math.cos(now / 1100 + i) * 0.12)) * dt;
        s.ps[i] = Math.max(-0.6, Math.min(0.6, s.ps[i] + s.vps[i] * dt));
        const a = STRANDS[i].angle * fan + (s.th[i] * 180) / Math.PI;
        strands[i].style.transform = `translateZ(${STRANDS[i].z}px) rotate(${a.toFixed(2)}deg) rotateX(${((s.ps[i] * 180) / Math.PI).toFixed(2)}deg)`;
        hangs[i].style.transform = `rotate(${(-a * 0.5).toFixed(2)}deg)`;
      }
      rig.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;

      // autoplay: three seconds a set, paused while you're holding, hovering or reading
      if (L.playing && !L.paused && !drag && !L.busy) {
        L.hold += dt * 1000;
        if (L.hold >= HOLD) goRef.current(L.set + 1);
      }
      dots.style.setProperty("--fill", String(Math.min(1, L.hold / HOLD)));
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("click", click, true);
      stage.removeEventListener("keydown", key);
    };
  }, []);

  const pause = () => {
    live.current.paused = true;
  };
  const resume = () => {
    live.current.paused = false;
  };
  // swipe the indicator (or the caption under the keychain) to jump a set
  const swipe = useRef<number | null>(null);
  const swipeHandlers = {
    onPointerDown: (e: React.PointerEvent) => (swipe.current = e.clientX),
    onPointerUp: (e: React.PointerEvent) => {
      if (swipe.current === null) return;
      const dx = e.clientX - swipe.current;
      swipe.current = null;
      if (Math.abs(dx) > 30) go(live.current.set + (dx < 0 ? 1 : -1));
    },
  };

  const people = SETS[set];

  return (
    <section className="team" id="team" aria-labelledby="team-h" data-sky="dark" onFocus={pause} onBlur={resume}>
      <div className="team-glow" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="wrap team-grid">
        <div className="team-copy">
          <h2 id="team-h">Meet the team</h2>
          <p className="lede">The people behind UBC PMC, 2026/27.</p>

          <div className="kc-nav" onPointerEnter={pause} onPointerLeave={resume}>
            <p className="kc-now">
              <b>{tiersOf(people)}</b>
              <span>
                {set * 3 + 1}–{set * 3 + people.length} of {TEAM.length}
              </span>
            </p>
            <div className="kc-dots" ref={dotsRef} {...swipeHandlers}>
              {SETS.map((g, k) => (
                <button
                  key={k}
                  type="button"
                  className={k === set ? "on" : k < set ? "done" : ""}
                  aria-label={`Show ${g.map((m) => first(m.name)).join(", ")}`}
                  aria-current={k === set ? "true" : undefined}
                  onClick={() => go(k)}
                >
                  <i />
                </button>
              ))}
            </div>
            <div className="kc-controls">
              <button type="button" className="icon-btn glass" aria-label="Previous three" onClick={() => go(set - 1)}>
                <ArrowLeft />
              </button>
              <button
                type="button"
                className="icon-btn glass"
                aria-label={playing ? "Pause the keychain" : "Play the keychain"}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause /> : <Play />}
              </button>
              <button type="button" className="icon-btn glass" aria-label="Next three" onClick={() => go(set + 1)}>
                <Arrow />
              </button>
            </div>
          </div>

          <div className="team-photos" aria-label="PMC photos">
            <figure className="team-pic">
              <img src={PHOTOS.group.src} alt={PHOTOS.group.alt} loading="lazy" />
              <figcaption>The whole crew</figcaption>
            </figure>
            <figure className="team-pic">
              <img src={PHOTOS.event.src} alt={PHOTOS.event.alt} loading="lazy" />
              <figcaption>Event day</figcaption>
            </figure>
          </div>
        </div>

        <div className="kc-col">
          <div
            className={`kc-stage${out ? " is-out" : ""}`}
            ref={stageRef}
            tabIndex={0}
            aria-label="The team keychain. Drag or use the arrow keys to twist it; drag the ring to swing it."
            onPointerEnter={pause}
            onPointerLeave={resume}
          >
            <div className="kc-rig" ref={rigRef}>
              <div className="kc-ring" data-ring="" aria-hidden="true" />
              <svg className="kc-charm" viewBox="0 0 200 200" aria-hidden="true" data-ring="">
                <path d={CHARM} />
                <circle cx="100" cy="100" r="30" />
              </svg>
              {STRANDS.map((st, i) => (
                <div key={i} className="kc-strand" hidden={!people[i]}>
                  <div className="kc-chain" aria-hidden="true">
                    {Array.from({ length: st.links }, (_, j) => (
                      <i key={j} className={j % 2 ? "side" : ""} />
                    ))}
                  </div>
                  <div className="kc-hang" style={{ top: st.links * LINK }}>
                    {people[i] && <Card key={people[i].name} m={people[i]} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="kc-hint" aria-hidden="true" {...swipeHandlers}>
            Swipe the dots to see the next three
          </p>
        </div>
      </div>

      <details className="wrap team-all">
        <summary>See the whole team ({TEAM.length})</summary>
        <ul>
          {TEAM.map((m) => (
            <li key={m.name}>
              <span className="ta-photo">{m.photo ? <img src={m.photo} alt="" loading="lazy" /> : initials(m.name)}</span>
              <span>
                <b>{m.name}</b>
                <small>{m.role}</small>
              </span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
