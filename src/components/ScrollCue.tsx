"use client";

import { useEffect, useState } from "react";
import { gearHole, gearPath } from "@/lib/gear";
import { easeInOutSine } from "@/lib/motion";

/** The sections the cue walks through, in page order. It stops once Get Involved arrives. */
const STOPS = ["#events", "#upcoming", "#about", "#offer", "#team", "#advisors", "#join"];
const GEAR = gearPath(50, 50, 48) + gearHole(50, 50, 15);
/** Idle time before the cue returns (ms): quickly in a pinned scene, where scrolling can feel stuck, patiently elsewhere. */
const WAIT = { pinned: 1200, open: 4000 };

/** How long a click on the cue takes to get there (ms): slowly through the eye, so the dive plays out; quicker otherwise. */
const GLIDE = { dive: 2100, hop: 1400 };

/** Scroll to `to` over `ms`, handing straight back to the visitor if they scroll, swipe or press a key themselves. */
function glide(to: number, ms: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return window.scrollTo({ top: to, behavior: "instant" });
  const from = window.scrollY, start = performance.now();
  let raf = 0;
  const stop = () => {
    cancelAnimationFrame(raf);
    for (const type of ["wheel", "touchstart", "keydown"]) window.removeEventListener(type, stop);
  };
  const tick = (now: number) => {
    const k = Math.min(1, (now - start) / ms);
    window.scrollTo({ top: from + (to - from) * easeInOutSine(k), behavior: "instant" }); // the page's smooth scrolling would fight each step
    if (k < 1) raf = requestAnimationFrame(tick);
    else stop();
  };
  for (const type of ["wheel", "touchstart", "keydown"]) window.addEventListener(type, stop, { passive: true });
  raf = requestAnimationFrame(tick);
}

/**
 * A nudge for visitors who don't realise there's more: the hero's dive and the pinned About scene hold the page still,
 * which reads as the end of it. Pointer convenience only; the nav and the skip link reach everything by keyboard.
 */
export default function ScrollCue() {
  const [shown, setShown] = useState(false);
  const [top, setTop] = useState(true);

  useEffect(() => {
    const join = document.querySelector("#join")!;
    let timer = 0;
    const wait = () => {
      const held = [...document.querySelectorAll(".hero, .about.is-scrolly")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= 0 && r.bottom > window.innerHeight;
      });
      return held ? WAIT.pinned : WAIT.open;
    };
    const scroll = () => {
      const atTop = window.scrollY < 8;
      setTop(atTop);
      setShown(atTop);
      window.clearTimeout(timer);
      if (!atTop) timer = window.setTimeout(() => setShown(join.getBoundingClientRect().top > window.innerHeight * 0.8), wait());
    };
    timer = window.setTimeout(scroll, 900); // let the hero land first
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  const next = () => {
    const el = STOPS.map((q) => document.querySelector(q)!).find((s) => s.getBoundingClientRect().top > 40);
    if (!el) return;
    const dive = el.id === "events";
    const to = el.getBoundingClientRect().top + window.scrollY - (dive ? 0 : 72);
    glide(to, dive ? GLIDE.dive : GLIDE.hop);
  };

  return (
    <button type="button" className={`cue${shown ? " on" : ""}`} onClick={next} tabIndex={-1} aria-hidden="true">
      <svg className="cue-gear" viewBox="0 0 100 100">
        <path d={GEAR} fillRule="evenodd" />
      </svg>
      <span>{top ? "Scroll to dive in" : "Keep scrolling"}</span>
      <svg className="cue-arrow" viewBox="0 0 16 16">
        <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
