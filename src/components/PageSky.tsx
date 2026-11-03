"use client";

import { useEffect, useRef } from "react";

/** The two grounds, and the dusk between them: through the brand lavender, never through grey. */
const DARK = "#1d1838";
const LIGHT = "#fbf9fe";
const DUSK = ["#1d1838", "#2b2160", "#4f3a96", "#8f72d2", "#d4c3f3", "#f2ecfc", "#fbf9fe"];
/** Half the length of a dark ↔ light change, in px. */
const T = 300;

/**
 * One background for the whole page, drawn once behind every section, so the page reads as a single
 * surface instead of stacked panels. Sections say which ground they sit on with `data-sky="dark|light"`;
 * `data-sky-at="start"` keeps the change inside that section's top, `"end"` inside the section before
 * (for joins an opaque scene already covers, like the hero's dive or the About gear's zoom).
 */
export default function PageSky() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let raf = 0;
    const paint = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const zones = [...document.querySelectorAll<HTMLElement>("[data-sky]")];
        const top = (z: HTMLElement) => z.getBoundingClientRect().top + window.scrollY;
        const stops: string[] = [];
        let tone = zones[0]?.dataset.sky ?? "light";
        stops.push(`${tone === "dark" ? DARK : LIGHT} 0px`);
        for (const z of zones.slice(1)) {
          const next = z.dataset.sky!;
          if (next === tone) continue;
          const y = top(z);
          const at = z.dataset.skyAt;
          const from = at === "start" ? y : at === "end" ? y - 2 * T : y - T;
          const ramp = tone === "dark" ? DUSK : [...DUSK].reverse();
          ramp.forEach((c, i) => stops.push(`${c} ${Math.round(from + (i / (ramp.length - 1)) * 2 * T)}px`));
          tone = next;
        }
        const h = document.documentElement.scrollHeight;
        stops.push(`${tone === "dark" ? DARK : LIGHT} ${h}px`);
        el.style.height = `${h}px`;
        el.style.background = `linear-gradient(180deg, ${stops.join(", ")})`;
      });
    };
    paint();
    // sections change height as fonts, photos and the pinned scenes settle
    const ro = new ResizeObserver(paint);
    ro.observe(document.body);
    document.querySelectorAll("[data-sky]").forEach((z) => ro.observe(z));
    const mo = new MutationObserver(paint);
    document.querySelectorAll("[data-sky]").forEach((z) => mo.observe(z, { attributes: true, attributeFilter: ["data-sky-at", "class"] }));
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return <div className="sky" ref={ref} aria-hidden="true" />;
}
