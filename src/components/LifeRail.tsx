"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { LIFE } from "@/data/site";
import { useReducedMotion } from "@/lib/motion";

const TILTS = [-3, 2.2, -1.6, 2.6, -2.2, 1.6];
const clampRatio = (r: number) => Math.max(0.7, Math.min(1.55, r));

/** Auto-scrolling, looping strip of polaroids; pauses on hover, and can be swiped or scrolled by hand. */
export default function LifeRail() {
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [ratios, setRatios] = useState<Record<string, number>>({});

  useEffect(() => {
    if (reduce) return;
    const el = railRef.current!;
    let raf = 0, last = performance.now(), onScreen = false;
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        last = performance.now();
      },
      { rootMargin: "100px" },
    );
    io.observe(el);
    const tick = (t: number) => {
      const dt = Math.min(t - last, 40);
      last = t;
      // one copy's width, measured between the two copies' first frames
      const kids = el.children, half = kids.length / 2;
      const period = (kids[half] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
      if (period > 0) {
        if (el.scrollLeft >= period + 1) el.scrollLeft -= period;
        else if (el.scrollLeft < 1) el.scrollLeft += period;
      }
      if (onScreen && !paused.current) el.scrollLeft += dt * 0.045;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce]);

  // repeated copies keep wide screens filled; the loop wraps by half the strip, which is identical
  const items = reduce ? LIFE : [...LIFE, ...LIFE, ...LIFE, ...LIFE];

  return (
    <section className="life" id="life" aria-labelledby="life-h">
      <div className="wrap head">
        <h2 id="life-h">Life at PMC</h2>
        <p className="lede">Socials, booths, event days and the people who make them happen.</p>
      </div>
      <div
        ref={railRef}
        className="rail"
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) paused.current = true;
        }}
        onMouseLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)}
        onTouchEnd={() => window.setTimeout(() => (paused.current = false), 2500)}
      >
        {items.map((p, i) => {
          const k = i % LIFE.length;
          return (
            <figure
              key={`${p.src}-${i}`}
              className="polaroid"
              style={{ "--tilt": `${TILTS[k % TILTS.length]}deg`, "--ratio": ratios[p.src] ?? p.ratio } as React.CSSProperties}
              aria-hidden={i >= LIFE.length ? true : undefined}
            >
              <div className="polaroid-photo">
                <img
                  src={p.src}
                  alt={i >= LIFE.length ? "" : p.alt}
                  decoding="async"
                  draggable={false}
                  onLoad={(e) => {
                    const im = e.currentTarget;
                    if (im.naturalWidth) {
                      const r = clampRatio(im.naturalWidth / im.naturalHeight);
                      setRatios((m) => (m[p.src] === r ? m : { ...m, [p.src]: r }));
                    }
                  }}
                />
                <span className="polaroid-tag">{p.tag}</span>
              </div>
              <figcaption>{p.caption}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
