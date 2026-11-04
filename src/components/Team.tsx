"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PHOTOS, TEAM, TEAMS, type Member } from "@/data/site";
import { gearPath } from "@/lib/gear";
import { useMedia } from "@/lib/motion";
import { Arrow, ArrowLeft, External, Pause, Play } from "./icons";
import { asset } from "@/lib/asset";

/** Every team hangs whole on the ring: Tech's eight, the two Co-Presidents. */
const SETS: Member[][] = TEAMS.map((t) => TEAM.filter((m) => m.team === t)).filter((s) => s.length);
/** A bigger team stays up a little longer, so there's time to read every card. */
const holdFor = (n: number) => 3800 + n * 450;
/** How long the keychain takes to fade out before the next team swaps in, and to fade back (ms). */
const FOLD = 240;
const LINK = 17; // px of chain per link
/** The strands hang from here, just under the ring (px below the rig's origin). */
const ORIGIN = 84;
/** The keychain's resting pose (deg), and how far a drag can twist it either way. */
const HOME = { ry: -8, rx: 6 };
const TWIST = 30;
const CHARM = gearPath(100, 100, 96);
const initials = (n: string) => n.split(/[\s-]+/).map((w) => w[0]).join("").slice(0, 2);
const first = (n: string) => n.split(" ")[0];

type Spot = { x: number; y: number; row: number };
type Layout = { cw: number; spots: Spot[]; height: number; perRow: number };

/**
 * Where each card hangs, as the point its eyelet sits at (x from the ring's centre, y below the strands' origin).
 * The cards share one row when they fit at a readable size, each one a little lower toward the middle like a real
 * keychain's fan; otherwise they wrap into rows, the back row on the shortest chains.
 */
function layout(n: number, width: number, cardH: (cw: number) => number): Layout {
  const gap = width < 560 ? 10 : 16;
  const minCw = width < 560 ? 96 : 128;
  let rows = 1, perRow = n, cw = 0;
  for (; rows <= n; rows++) {
    perRow = Math.ceil(n / rows);
    cw = Math.min(196, (width - (perRow - 1) * gap) / perRow);
    if (cw >= minCw || perRow === 1) break;
  }
  cw = Math.floor(cw);
  const h = cardH(cw);
  // a small team spreads out a little more than it strictly needs, so two cards don't huddle in the middle
  const step = cw + gap + (perRow <= 3 ? Math.min(64, (width - perRow * cw) / (perRow + 1) / 2) : 0);
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perRow);
    const inRow = row === rows - 1 ? n - row * perRow : perRow;
    const col = i - row * perRow;
    const x = (col - (inRow - 1) / 2) * step;
    const reach = ((inRow - 1) / 2) * step || 1;
    const sag = (rows === 1 ? 70 : 26) * (1 - (x / reach) ** 2); // the middle hangs lowest
    const jitter = col % 2 ? 14 : 0; // neighbours on slightly different chain lengths, as a real keychain hangs
    spots.push({ x, y: 120 + row * (h + 26) + sag + jitter, row });
  }
  const height = ORIGIN + 30 + Math.max(...spots.map((s) => s.y)) + h + 50;
  return { cw, spots, height, perRow };
}

/** The team's VP (first in the list) moves to the middle of the top row, with everyone else around them. */
function centreVP(people: Member[], perRow: number) {
  if (!people[0].role.startsWith("VP")) return people;
  const [vp, ...rest] = people;
  const mid = Math.floor((Math.min(perRow, people.length) - 1) / 2);
  return [...rest.slice(0, mid), vp, ...rest.slice(mid)];
}

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
  const face = (
    <>
      <i className="kc-eyelet" aria-hidden="true" />
      <span className="kc-photo">{m.photo ? <img src={m.photo} alt="" draggable={false} /> : <span>{initials(m.name)}</span>}</span>
      <span className="kc-name">{m.name}</span>
      <span className="kc-role">{m.role}</span>
      <Badge m={m} />
      {m.url && (
        <span className="kc-open" aria-hidden="true">
          <External />
        </span>
      )}
      <i className="kc-sheen" aria-hidden="true" />
    </>
  );
  return (
    <div className="kc-card">
      {m.url ? (
        <a className="kc-face front" href={m.url} target="_blank" rel="noopener" draggable={false} aria-label={`${m.name}, ${m.role}. Opens in a new tab`}>
          {face}
        </a>
      ) : (
        <div className="kc-face front">{face}</div>
      )}
    </div>
  );
}

export default function Team() {
  const [set, setSet] = useState(0);
  const [out, setOut] = useState(false);
  const [chosen, setPlaying] = useState(true);
  const [all, setAll] = useState(false);
  const [width, setWidth] = useState(1000);
  // the card's height beyond its photo (name, role, padding), measured once the cards are on the page
  const [extra, setExtra] = useState(104);
  // no autoplay for reduced motion; the team buttons and arrows still change teams
  const reduced = useMedia("(prefers-reduced-motion: reduce)", true);
  const playing = chosen && !reduced;
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const live = useRef({ set: 0, busy: false, hold: 0, paused: false, playing: true, spread: 0, n: SETS[0].length });

  const people = SETS[set];
  const geo = layout(people.length, width, (cw) => cw + extra);
  // phones swipe through one long rail instead of wrapping the keychain into tiny rows
  const phone = useMedia("(max-width: 640px)");
  const hung = centreVP(people, phone ? people.length : geo.perRow);
  const railRef = useRef<HTMLDivElement>(null);
  const vpName = people[0].role.startsWith("VP") ? people[0].name : null;
  // each team opens on the rail with its VP centred
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const vp = rail.querySelector<HTMLElement>("[data-vp]");
    rail.scrollLeft = vp ? vp.offsetLeft - (rail.clientWidth - vp.offsetWidth) / 2 : 0;
  }, [phone, set]);
  // the strands' angles and lengths, for the physics loop
  const strands = geo.spots.map((s) => ({
    angle: (Math.atan2(-s.x, s.y) * 180) / Math.PI,
    links: Math.max(3, Math.round(Math.hypot(s.x, s.y) / LINK)),
    // later rows hang behind the first, so their longer chains pass behind its cards, not across their faces
    z: s.row * -60,
  }));
  const strandsRef = useRef(strands);

  /** Fade the keychain out, swap in team k, fade it back. The burst out of the ring only happens once, on arrival. */
  const go = (k: number) => {
    const L = live.current;
    const next = (k + SETS.length) % SETS.length;
    if (L.busy || next === L.set) return;
    L.busy = true;
    L.hold = 0;
    setOut(true);
    window.setTimeout(() => {
      L.set = next;
      L.n = SETS[next].length;
      setSet(next);
      requestAnimationFrame(() => {
        setOut(false);
        window.setTimeout(() => (L.busy = false), FOLD);
      });
    }, FOLD);
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
    strandsRef.current = strands;
    live.current.playing = playing;
  });

  // measure a card, so rows and the stage's height fit the real text
  useLayoutEffect(() => {
    const cards = [...rigRef.current!.querySelectorAll<HTMLElement>(".kc-face")];
    if (!cards.length || !cards[0].offsetHeight) return; // the stage is hidden on phones
    const tallest = Math.max(...cards.map((c) => c.offsetHeight)) - geo.cw;
    if (Math.abs(tallest - extra) > 2) setExtra(tallest);
  }, [set, width, geo.cw, extra]);

  useEffect(() => {
    const stage = stageRef.current!;
    const rig = rigRef.current!;
    const dots = dotsRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const L = live.current;

    const ro = new ResizeObserver(() => setWidth(Math.round(stage.clientWidth)));
    ro.observe(stage);

    // the keychain is a little physics toy: an anchor on a spring, a turn with inertia, a pendulum per strand,
    // and the fan itself on a bouncy spring, so a new team bursts out of the ring
    const MAX = Math.max(...SETS.map((s) => s.length));
    const s = {
      x: 0, y: 0, vx: 0, vy: 0, ax: 0, lastX: 0,
      ry: HOME.ry, vry: 0, rx: HOME.rx, vrx: 0,
      th: Array.from({ length: MAX }, (_, i): number => (i % 2 ? -0.04 : 0.05)), vth: new Array(MAX).fill(0),
      ps: new Array(MAX).fill(0), vps: new Array(MAX).fill(0),
      sp: 0, vsp: 0,
    };
    let drag: { mode: "ring" | "turn"; px: number; py: number; ox: number; oy: number; moved: number } | null = null;
    let suppress = false;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const ring = !!(e.target as HTMLElement).closest("[data-ring]");
      drag = { mode: ring ? "ring" : "turn", px: e.clientX, py: e.clientY, ox: s.x, oy: s.y, moved: 0 };
      stage.classList.add("grabbing");
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
      if (!drag.moved && Math.hypot(dx, dy) > 6) {
        // only capture once it's really a drag, so a plain click still reaches the card's link
        try {
          stage.setPointerCapture(e.pointerId);
        } catch {} // a pointer that already ended can't be captured; the drag still works without it
      }
      if (drag.mode === "ring") {
        const w = stage.clientWidth * 0.3;
        s.x = Math.max(-w, Math.min(w, drag.ox + dx));
        s.y = Math.max(-60, Math.min(120, drag.oy + dy));
        drag.moved = Math.hypot(dx, dy);
      } else {
        // rubber-banded: the further it twists, the harder it pulls back, so a card never turns edge-on
        const pull = 1 - Math.min(0.85, Math.abs(s.ry - HOME.ry) / TWIST);
        const d = (e.movementX || 0) * 0.3 * pull;
        s.vry = d * 60; // deg/s, handed to the spring on release
        s.ry = Math.max(HOME.ry - TWIST, Math.min(HOME.ry + TWIST, s.ry + d));
        s.rx = Math.max(-12, Math.min(16, s.rx - (e.movementY || 0) * 0.1));
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

    // the first team bursts out of the ring when the keychain scrolls into view
    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !L.busy) L.spread = 1;
      },
      { rootMargin: "-10% 0px" },
    );
    io.observe(stage);

    let raf = 0, then = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - then) / 1000);
      then = now;
      if (document.hidden || !visible) return;
      const strandEls = rig.querySelectorAll<HTMLElement>(".kc-strand");
      const hangEls = rig.querySelectorAll<HTMLElement>(".kc-hang");
      const st = strandsRef.current;

      // the fan: opens once on a soft spring when the keychain first scrolls into view, and stays open
      if (reduce) s.sp = L.spread;
      else if (L.spread > 0) {
        s.vsp += (34 * (1 - s.sp) - 10 * s.vsp) * dt;
        s.sp += s.vsp * dt;
      }
      const open = Math.max(0, s.sp);

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

      // pendulums: the anchor's sideways jolt swings them, the turn tips them, a breeze keeps them alive.
      // Small swings only: with a whole team on the ring, neighbours mustn't swing into each other.
      for (let i = 0; i < strandEls.length && i < st.length; i++) {
        const breeze = reduce ? 0 : Math.sin(now / 2200 + i * 2.1) * 0.08;
        s.vth[i] += (-10 * s.th[i] - 1.2 * s.vth[i] - s.ax / 700 + breeze) * dt;
        s.th[i] = Math.max(-0.25, Math.min(0.25, s.th[i] + s.vth[i] * dt));
        s.vps[i] += (-9 * s.ps[i] - 1.1 * s.vps[i] - s.vry * 0.001 + (reduce ? 0 : Math.cos(now / 2600 + i) * 0.04)) * dt;
        s.ps[i] = Math.max(-0.5, Math.min(0.5, s.ps[i] + s.vps[i] * dt));
        const a = st[i].angle * open + (s.th[i] * 180) / Math.PI * Math.min(1, 6 / st.length);
        const grow = 0.2 + 0.8 * Math.min(1.06, open);
        strandEls[i].style.transform = `translateZ(${st[i].z}px) rotate(${a.toFixed(2)}deg) rotateX(${((s.ps[i] * 180) / Math.PI).toFixed(2)}deg) scale(${grow.toFixed(3)})`;
        // cards stay nearly upright whatever their strand's angle, the way a charm turns to hang straight
        hangEls[i].style.transform = `rotate(${(-a * 0.85).toFixed(2)}deg)`;
      }
      // at rest the whole keychain bobs slowly up and down
      const bob = reduce ? 0 : Math.sin(now / 1500) * 7;
      rig.style.transform = `translate3d(${s.x.toFixed(1)}px, ${(s.y + bob).toFixed(1)}px, 0) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;

      // autoplay: a few seconds a team, paused while you're holding, hovering or reading
      const hold = holdFor(L.n);
      if (visible && L.playing && !L.paused && !drag && !L.busy) {
        L.hold += dt * 1000;
        if (L.hold >= hold) goRef.current(L.set + 1);
      }
      dots.style.setProperty("--fill", String(Math.min(1, L.hold / hold)));
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

  // on phones the rail walks itself through the team, then on to the next; a touch hands it over to you for a moment
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !phone || !playing) return;
    const items = [...rail.querySelectorAll<HTMLElement>(".kc-rail-item")];
    const centre = (el: HTMLElement) => el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2;
    let at = Math.max(0, items.findIndex((el) => el.hasAttribute("data-vp")));
    let seen = 1, held = false, onScreen = false, resume = 0;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.5 });
    io.observe(rail);
    const hold = () => {
      held = true;
      window.clearTimeout(resume);
    };
    const release = () => {
      resume = window.setTimeout(() => {
        held = false;
        at = items.reduce((best, el, i) => (Math.abs(centre(el) - rail.scrollLeft) < Math.abs(centre(items[best]) - rail.scrollLeft) ? i : best), 0);
      }, 3000);
    };
    rail.addEventListener("touchstart", hold, { passive: true });
    rail.addEventListener("touchend", release, { passive: true });
    rail.addEventListener("touchcancel", release, { passive: true });
    const step = window.setInterval(() => {
      if (held || !onScreen || document.hidden) return;
      if (seen >= items.length) return goRef.current(live.current.set + 1);
      at = (at + 1) % items.length;
      seen++;
      rail.scrollTo({ left: centre(items[at]), behavior: "smooth" });
    }, 2400);
    return () => {
      window.clearInterval(step);
      window.clearTimeout(resume);
      io.disconnect();
      rail.removeEventListener("touchstart", hold);
      rail.removeEventListener("touchend", release);
      rail.removeEventListener("touchcancel", release);
    };
  }, [phone, playing, set]);

  const pause = () => {
    live.current.paused = true;
  };
  const resume = () => {
    live.current.paused = false;
  };
  // swipe the indicator (or the hint under the keychain) to jump a team
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

  return (
    <section className="team" id="team" aria-labelledby="team-h" onFocus={pause} onBlur={resume}>
      <div className="team-props" aria-hidden="true">
        <img src={asset("/gears/orchid-9.webp")} alt="" />
      </div>
      <div className="wrap team-top">
        <div className="team-copy">
          <h2 id="team-h">Meet the team</h2>
          <p className="lede">The people behind UBC PMC, 2026/27. Click anyone to say hi.</p>

          <div className="kc-nav" onPointerEnter={pause} onPointerLeave={resume}>
            <div className="kc-teams" role="group" aria-label="Choose a team">
              {SETS.map((g, k) => (
                <button key={g[0].team} type="button" aria-pressed={k === set} onClick={() => go(k)}>
                  {g[0].team}
                </button>
              ))}
            </div>
            <div className="kc-bar">
              <p className="kc-now" aria-live="polite">
                <b>{people[0].team}</b>
                <span>
                  {people.length} {people.length === 1 ? "person" : "people"}
                </span>
              </p>
              <div className="kc-controls">
                <button type="button" className="icon-btn glass" aria-label="Previous team" onClick={() => go(set - 1)}>
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
                <button type="button" className="icon-btn glass" aria-label="Next team" onClick={() => go(set + 1)}>
                  <Arrow />
                </button>
              </div>
            </div>
            <div className="kc-dots" ref={dotsRef} aria-hidden="true" {...swipeHandlers}>
              {SETS.map((g, k) => (
                <span key={k} className={k === set ? "on" : k < set ? "done" : ""}>
                  <i />
                </span>
              ))}
            </div>
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

      <div className="wrap kc-col">
        <div
          className={`kc-stage${out ? " is-out" : ""}`}
          ref={stageRef}
          tabIndex={0}
          style={{ height: geo.height, "--cw": `${geo.cw}px` } as React.CSSProperties}
          aria-label={`The ${people[0].team} keychain. Drag or use the arrow keys to twist it; drag the ring to swing it.`}
          onPointerEnter={pause}
          onPointerLeave={resume}
        >
          <div className="kc-rig" ref={rigRef}>
            <div className="kc-ring" data-ring="" aria-hidden="true" />
            <svg className="kc-charm" viewBox="0 0 200 200" aria-hidden="true" data-ring="">
              <path d={CHARM} />
              <circle cx="100" cy="100" r="30" />
            </svg>
            {hung.map((m, i) => (
              <div key={i} className="kc-strand" style={{ transform: "scale(0.2)" }}>
                <div className="kc-chain" aria-hidden="true">
                  {Array.from({ length: strands[i].links }, (_, j) => (
                    <i key={j} className={j % 2 ? "side" : ""} />
                  ))}
                </div>
                <div className="kc-hang" style={{ top: strands[i].links * LINK }}>
                  <Card key={m.name} m={m} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {phone && (
          <>
            <div className={`kc-rail${out ? " is-out" : ""}`} ref={railRef} role="group" aria-label={`The ${people[0].team} team`}>
              <div className="kc-rail-track">
                {hung.map((m) => (
                  <div key={m.name} className="kc-rail-item" data-vp={m.name === vpName ? "" : undefined}>
                    <div className="kc-chain" aria-hidden="true">
                      <i />
                      <i className="side" />
                      <i />
                    </div>
                    <Card m={m} />
                  </div>
                ))}
              </div>
            </div>
            {people.length > 1 && (
              <p className="kc-rail-hint" aria-hidden="true">
                Swipe to see everyone
              </p>
            )}
          </>
        )}
        <p className="kc-hint" aria-hidden="true" {...swipeHandlers}>
          Swipe here for the next team
        </p>
      </div>

      <div className={`wrap team-all${all ? " open" : ""}`}>
        <button type="button" className="team-all-btn" aria-expanded={all} aria-controls="team-all-list" onClick={() => setAll((o) => !o)}>
          {all ? "Close" : `See the whole team (${TEAM.length})`}
        </button>
        <div className="team-all-fold" id="team-all-list" inert={!all}>
          <ul>
            {TEAM.map((m) => (
              <li key={m.name}>
                <span className="ta-photo">{m.photo ? <img src={m.photo} alt="" loading="lazy" /> : initials(m.name)}</span>
                <span>
                  {m.url ? (
                    <a href={m.url} target="_blank" rel="noopener">
                      {m.name}
                    </a>
                  ) : (
                    <b>{m.name}</b>
                  )}
                  <small>
                    {m.role} · {m.team}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
