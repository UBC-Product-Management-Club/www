"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { TEAM, img } from "@/data/site";
import { gearPath } from "@/lib/gear";
import { sectionProgress } from "@/lib/motion";
import GearyMini, { type GearyDriver } from "./GearyMini";

const FRAME = gearPath(100, 100, 98, { teeth: 10, rTip: 1, rRoot: 0.82, tipHalf: 0.13, rootHalf: 0.2 });
const COG = gearPath(100, 100, 98, { teeth: 12, rTip: 1, rRoot: 0.84, tipHalf: 0.1, rootHalf: 0.16 });
const RAMP = ["#8b9cf2", "#a97fdc", "#d25fa6", "#e4405e"];
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("");
type Person = (typeof TEAM)["exec"][number];

/** Two factory lines: executives and advisors run left, directors run right. */
const LINES: { key: string; label: string; people: Person[]; dir: 1 | -1 }[] = [
  { key: "a", label: "Executives and advisors", people: [...TEAM.exec, ...TEAM.adv], dir: -1 },
  { key: "b", label: "Directors", people: TEAM.dir, dir: 1 },
];
/** Px the belts travel before the first card meets Geary and after the last one leaves. */
const LEAD = 70;

function Member({ person, i }: { person: Person; i: number }) {
  const [name, role, photo, li] = person;
  const id = `gear-${i}`;
  // every frame gets its own turn of the brand ramp, so the line shimmers instead of repeating
  const angle = (i * 67) % 360;
  return (
    <li className="unit" style={{ "--spin": i % 2 ? "-36deg" : "36deg" } as React.CSSProperties}>
      <a href={`https://www.linkedin.com/in/${li}/`} target="_blank" rel="noopener" className="member">
        <span className="member-frame">
          <svg viewBox="0 0 200 200" aria-hidden="true" className="member-gear">
            <defs>
              <linearGradient id={id} gradientTransform={`rotate(${angle} .5 .5)`}>
                {RAMP.map((c, k) => (
                  <stop key={c} offset={k / (RAMP.length - 1)} stopColor={c} />
                ))}
              </linearGradient>
            </defs>
            <path d={FRAME} fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth="6" strokeLinejoin="round" />
          </svg>
          <span className="member-photo">
            {photo ? <img src={img(photo, 256)} alt="" loading="lazy" decoding="async" /> : <span>{initials(name)}</span>}
          </span>
        </span>
        <b>{name}</b>
        <span className="role">{role}</span>
        <span className="sr"> (LinkedIn)</span>
      </a>
    </li>
  );
}

function Cog({ className, teeth = COG }: { className: string; teeth?: string }) {
  return (
    <svg className={`cog ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <path d={teeth} />
      <circle cx="100" cy="100" r="34" />
    </svg>
  );
}

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);
  const driver = useRef<GearyDriver>({ gaze: null, speed: 0.35, hops: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // the plain grid stays
    const section = sectionRef.current!;
    const stage = section.querySelector<HTMLElement>(".factory-stage")!;
    const geary = section.querySelector<HTMLElement>(".station-geary")!;
    const cogs = [...section.querySelectorAll<SVGElement>(".cog")];
    const lines = [...section.querySelectorAll<HTMLElement>(".line")];
    section.classList.add("is-live");

    type Line = {
      cargo: HTMLElement;
      tread: HTMLElement;
      rollers: HTMLElement[];
      units: HTMLElement[];
      centres: number[];
      half: number; // half a unit's width
      w: number;
      dir: number;
      eyeY: number; // where Geary looks on this line, relative to the stage
      at: number; // index of the member at Geary's station, or -1
    };
    let L: Line[] = [];
    let cx = 0, travel = 0;
    let g = { x: 0, y: 0, w: 1, h: 1 };

    // all layout reads happen here, on resize; the frame loop only writes transforms
    const measure = () => {
      cx = stage.clientWidth / 2;
      L = lines.map((el, k) => {
        const cargo = el.querySelector<HTMLElement>(".cargo")!;
        const units = [...cargo.querySelectorAll<HTMLElement>(".unit")];
        return {
          cargo,
          tread: el.querySelector<HTMLElement>(".tread")!,
          rollers: [...el.querySelectorAll<HTMLElement>(".belt-side b")],
          units,
          centres: units.map((u) => u.offsetLeft + u.offsetWidth / 2),
          half: (units[0]?.offsetWidth ?? 0) / 2,
          w: cargo.scrollWidth,
          dir: LINES[k].dir,
          eyeY: el.offsetTop + cargo.offsetTop + cargo.offsetHeight * 0.4,
          at: L[k]?.at ?? -1,
        };
      });
      const station = geary.parentElement!;
      g = { x: station.offsetLeft + geary.offsetLeft, y: station.offsetTop + geary.offsetTop, w: geary.offsetWidth, h: geary.offsetHeight };
      travel = Math.max(...L.map((l) => l.w + LEAD * 2));
      // the longer belt moves ~1.7px per px scrolled: brisk, not a slog
      section.style.height = `calc(100svh + ${Math.round(travel * 0.6)}px)`;
      last = -1;
    };
    let last = -1;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    lines.forEach((el) => ro.observe(el.querySelector(".cargo")!)); // fonts and photos settle the belt widths

    // belt offset at progress p: line A starts just right of Geary and runs left, line B the reverse
    const offset = (l: Line, p: number) =>
      l.dir < 0 ? cx + LEAD - p * (l.w + LEAD * 2) : cx - LEAD - l.w + p * (l.w + LEAD * 2);

    // keyboard: tabbing to a member scrolls the line until they're at Geary's station
    const focus = (e: FocusEvent) => {
      const unit = (e.target as HTMLElement).closest<HTMLElement>(".unit");
      const l = unit && L.find((x) => x.units.includes(unit));
      if (!unit || !l) return;
      const c = l.centres[l.units.indexOf(unit)];
      const span = l.w + LEAD * 2;
      const p = l.dir < 0 ? (LEAD + c) / span : (LEAD + l.w - c) / span;
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + p * (section.offsetHeight - window.innerHeight), behavior: "instant" });
      shown = p;
    };
    section.addEventListener("focusin", focus);

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(section);

    let raf = 0, shown = -1, then = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      if (!visible) return;
      const p = sectionProgress(section);
      // glide toward the scroll position, so wheel steps become motion instead of jumps
      const prev = shown;
      shown = shown < 0 ? p : shown + (p - shown) * (1 - Math.exp(-dt * 16));
      if (Math.abs(p - shown) < 0.00005) shown = p;
      const d = driver.current;
      d.speed += (0.35 + Math.min(10, Math.abs(shown - prev) * 1200) - d.speed) * 0.15;
      if (shown === last) return;
      last = shown;

      let best = Infinity, gazeX = cx, gazeY = 0;
      for (const l of L) {
        const x = offset(l, shown);
        l.cargo.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        // treads slide with the belt (the stripe repeats every 26px); rollers turn at radius 7px
        l.tread.style.transform = `translate3d(${((x % 26) - 26).toFixed(1)}px,0,0)`;
        const roll = `rotate(${((x / 7) * (180 / Math.PI)).toFixed(0)}deg)`;
        for (const r of l.rollers) r.style.transform = roll;

        let at = -1;
        for (let i = 0; i < l.centres.length; i++) {
          const dist = Math.abs(x + l.centres[i] - cx);
          if (dist < l.half) at = i;
          if (dist < best) {
            best = dist;
            gazeX = x + l.centres[i];
            gazeY = l.eyeY;
          }
        }
        if (at !== l.at) {
          if (l.at >= 0) l.units[l.at].classList.remove("at-station");
          if (at >= 0) {
            l.units[at].classList.add("at-station");
            d.hops++; // Geary hops for each member who arrives
          }
          l.at = at;
        }
      }
      const turn = shown * travel * 0.9;
      cogs.forEach((c, i) => (c.style.transform = `rotate(${(turn * [-0.5, 0.8, -1.2][i]).toFixed(1)}deg)`));
      d.gaze = { x: ((gazeX - g.x) / g.w) * 2 - 1, y: -((gazeY - g.y) / g.h) * 2 + 1 };
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("focusin", focus);
      section.classList.remove("is-live");
      section.style.height = "";
    };
  }, []);

  let n = 0;
  return (
    <section className="factory" id="team" ref={sectionRef} aria-labelledby="team-h">
      <div className="factory-stage">
        <div className="wrap factory-head">
          <h2 id="team-h">Meet the team</h2>
          <p className="lede">The people behind UBC PMC, 2025/26.</p>
        </div>

        <div className="station" aria-hidden="true">
          <GearyMini driver={driver} className="station-geary" />
          <i className="plinth" />
        </div>

        <Cog className="cog-a" />
        <Cog className="cog-b" />
        <Cog className="cog-c" />

        {LINES.map((line, k) => (
          <div key={line.key} className={`line line-${line.key}`} style={{ gridRow: k ? 4 : 2 }}>
            <ul className="cargo" aria-label={line.label}>
              {line.people.map((p) => (
                <Member key={p[0]} person={p} i={n++} />
              ))}
            </ul>
            <div className="belt" aria-hidden="true">
              <i className="belt-top">
                <i className="tread" />
              </i>
              <i className="belt-side">
                {Array.from({ length: 14 }, (_, r) => (
                  <b key={r} />
                ))}
              </i>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
