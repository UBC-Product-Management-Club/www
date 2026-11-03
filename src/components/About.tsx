"use client";

import { useEffect, useRef, useState } from "react";
import { STATS } from "@/data/site";
import { gearPath } from "@/lib/gear";
import { easeOut, range, sectionProgress, useMedia } from "@/lib/motion";
import { Cursors } from "./Playthings";

const GEAR_D = gearPath(500, 500, 496);
/** Each stat as a tab: its window title, and what one dot in its grid stands for. */
const TABS = [
  { tab: "Students", slug: "students", per: 10, unit: "Each dot is 10 students." },
  { tab: "Events", slug: "events", per: 1, unit: "Each tile is one event." },
  { tab: "Members", slug: "members", per: 1, unit: "Each dot is one member." },
];
const RAMP = ["#8b9cf2", "#a97fdc", "#d25fa6", "#e4405e"];
/** Progress where the stat steps start and end, once the gear has zoomed out. */
const STEP_FROM = 0.26, STEP_TO = 0.94;

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const gearRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const scrolly = useMedia("(min-width: 960px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)");

  useEffect(() => {
    const section = sectionRef.current!;
    const els = [gearRef, spinRef, statsRef, copyRef].map((r) => r.current!);
    const [gear, spin, stats, copy] = els;
    const reset = () =>
      els.forEach((el) => {
        el.style.removeProperty("transform");
        el.style.removeProperty("opacity");
      });
    reset();
    if (!scrolly) return reset;

    // every write below is a transform or an opacity on its own layer: no layout, no repaint
    let raf = 0, shown = -1, then = performance.now(), visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(section);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      if (!visible) return;
      const p = sectionProgress(section);
      // glide toward the scroll position, so wheel steps turn into motion
      const next = shown < 0 ? p : shown + (p - shown) * (1 - Math.exp(-dt * 14));
      if (Math.abs(next - shown) < 0.00002) return;
      shown = Math.abs(p - next) < 0.00005 ? p : next;
      // the gear settles in from a little larger, then turns one tooth per stat
      const out = easeOut(range(shown, 0, 0.22));
      const turn = range(shown, STEP_FROM, STEP_TO) * (STATS.length - 1);
      gear.style.transform = `scale(${(1 + 0.5 * (1 - out)).toFixed(4)})`;
      spin.style.transform = `rotate(${(turn * 45 + shown * 12).toFixed(2)}deg)`;
      stats.style.opacity = range(shown, 0.04, 0.18).toFixed(3);
      const c = range(shown, 0.12, 0.26);
      copy.style.opacity = c.toFixed(3);
      copy.style.transform = `translate3d(0, ${((1 - c) * 30).toFixed(1)}px, 0)`;
      const step = Math.round(turn);
      setActive((a) => (a === step ? a : step));
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      reset();
    };
  }, [scrolly]);

  // a tab click scrolls the pinned scene to that stat; without pinning it just turns the gear
  const pick = (k: number) => {
    if (!scrolly) return setActive(k);
    const s = sectionRef.current!;
    const top = s.getBoundingClientRect().top + window.scrollY;
    const p = STEP_FROM + (k / (STATS.length - 1)) * (STEP_TO - STEP_FROM);
    window.scrollTo({ top: top + p * (s.offsetHeight - window.innerHeight), behavior: "smooth" });
  };
  const onTabKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const k = (active + d + STATS.length) % STATS.length;
    pick(k);
    (e.currentTarget.parentElement!.children[k] as HTMLElement).focus();
  };

  const stat = STATS[active];
  const tab = TABS[active];
  const n = parseInt(stat.n, 10) / tab.per;

  return (
    <section
      className={`about${scrolly ? " is-scrolly" : ""}`}
      id="about"
      ref={sectionRef}
      aria-labelledby="about-h"
    >
      <div className="about-stage">
        <Cursors />
        <div className="about-gear-col">
          <div className="about-gear" ref={gearRef} aria-hidden="true">
            <i className="about-gear-shadow" />
            <div
              className="about-gear-spin"
              ref={spinRef}
              style={scrolly ? undefined : { transform: `rotate(${active * 45}deg)` }}
            >
              <svg viewBox="0 0 1000 1000">
                <defs>
                  <linearGradient id="about-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#5f6fdc" />
                    <stop offset=".38" stopColor="#8a58cf" />
                    <stop offset=".72" stopColor="#bf418c" />
                    <stop offset="1" stopColor="#d23350" />
                  </linearGradient>
                  <radialGradient id="about-sheen" cx=".3" cy=".25" r=".9">
                    <stop offset="0" stopColor="#fff" stopOpacity=".35" />
                    <stop offset=".5" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path d={GEAR_D} fill="url(#about-grad)" />
                <path d={GEAR_D} fill="url(#about-sheen)" />
                <circle cx="500" cy="500" r="330" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="3" />
              </svg>
            </div>
            <div className="about-stats" ref={statsRef}>
              {STATS.map((s, i) => (
                <p key={s.label} className={i === active ? "on" : i < active ? "past" : ""}>
                  <b>{s.n}</b>
                  <span>{s.label}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="about-copy" ref={copyRef}>
          <div className="about-text">
            <div>
              <h2 id="about-h">We demystify product management.</h2>
              <p>
                Founded in 2020, UBC PMC uses industry connections, a tight-knit student network and real PM experience
                to get students ready for product roles.
              </p>
            </div>
            <div>
              <h3>Our mission</h3>
              <p>A vibrant, inclusive community where aspiring product managers learn, build and grow together.</p>
            </div>
          </div>

          <div className="mac">
            <div className="mac-bar">
              <span className="mac-lights" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="mac-tabs" role="tablist" aria-label="PMC by the numbers">
                {STATS.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    role="tab"
                    id={`stat-tab-${i}`}
                    aria-selected={i === active}
                    aria-controls="stat-panel"
                    tabIndex={i === active ? 0 : -1}
                    onClick={() => pick(i)}
                    onKeyDown={onTabKey}
                  >
                    <b>{s.n}</b> <span>{TABS[i].tab}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mac-url" aria-hidden="true">
              ubcpmc.com/{tab.slug}
            </div>
            <div className="mac-panel" role="tabpanel" id="stat-panel" aria-labelledby={`stat-tab-${active}`}>
              <p className="mac-stat">
                <b>{stat.n}</b> {stat.label}
              </p>
              <div className={`mac-dots${tab.per === 1 && active === 1 ? " tiles" : ""}`} aria-hidden="true">
                {Array.from({ length: n }, (_, i) => (
                  <i key={`${active}-${i}`} style={{ background: RAMP[Math.floor((i / n) * RAMP.length)], animationDelay: `${i * 8}ms` }} />
                ))}
              </div>
              <p className="mac-unit">{tab.unit}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
