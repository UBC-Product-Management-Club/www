"use client";

import { useEffect, useRef, useState } from "react";
import { STATS } from "@/data/site";
import { gearPath } from "@/lib/gear";
import { easeOut, range, sectionProgress, useMedia } from "@/lib/motion";

const GEAR_D = gearPath(500, 500, 496);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const gearRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<SVGSVGElement>(null);
  const statsRef = useRef<HTMLUListElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const scrolly = useMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");

  useEffect(() => {
    const section = sectionRef.current!;
    const els = [gearRef, spinRef, inkRef, statsRef, copyRef].map((r) => r.current!);
    const [gear, spin, ink, stats, copy] = els;
    const reset = () =>
      els.forEach((el) => {
        el.style.removeProperty("transform");
        el.style.removeProperty("opacity");
      });
    reset();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return reset;

    // every write below is a transform or an opacity on its own layer: no layout, no repaint
    let raf = 0, shown = -1, then = performance.now(), visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(section);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      if (!visible) return;
      if (!scrolly) {
        // small screens: no pinning, but the gear still turns as it passes
        const r = section.getBoundingClientRect();
        spin.style.transform = `rotate(${(((window.innerHeight - r.top) / window.innerHeight) * 50).toFixed(2)}deg)`;
        return;
      }
      const p = sectionProgress(section);
      // glide toward the scroll position, so wheel steps turn into motion
      const next = shown < 0 ? p : shown + (p - shown) * (1 - Math.exp(-dt * 14));
      if (Math.abs(next - shown) < 0.00002) return;
      shown = Math.abs(p - next) < 0.00005 ? p : next;
      // zoom out of the dark (we were inside the gear), then turn one tooth per stat
      const out = easeOut(range(shown, 0, 0.22));
      const turn = range(shown, 0.26, 0.94) * (STATS.length - 1);
      const dark = 1 - range(shown, 0.02, 0.2);
      gear.style.transform = `scale(${(1 + 11 * (1 - out)).toFixed(4)})`;
      spin.style.transform = `rotate(${(turn * 45 + shown * 12).toFixed(2)}deg)`;
      ink.style.opacity = dark.toFixed(3);
      stats.style.opacity = (1 - dark).toFixed(3);
      const c = range(shown, 0.14, 0.26);
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

  return (
    <section className={`about${scrolly ? " is-scrolly" : ""}`} id="about" ref={sectionRef} aria-labelledby="about-h">
      <div className="about-stage">
        <div className="about-gear" ref={gearRef} aria-hidden="true">
          <i className="about-gear-shadow" />
          <div className="about-gear-spin" ref={spinRef}>
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
              <circle cx="500" cy="500" r="300" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="3" />
              <circle cx="500" cy="500" r="92" fill="#fbf9fe" fillOpacity=".95" />
              <circle cx="500" cy="500" r="64" fill="none" stroke="#a97fdc" strokeWidth="6" />
            </svg>
            <svg className="about-gear-ink" viewBox="0 0 1000 1000" ref={inkRef}>
              <path d={GEAR_D} fill="#1d1838" />
            </svg>
          </div>
          <ul className="about-stats" ref={statsRef}>
            {STATS.map((s, i) => (
              <li key={s.label} className={i === active ? "on" : i < active ? "past" : ""}>
                <b>{s.n}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="about-copy" ref={copyRef}>
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
      </div>
    </section>
  );
}
