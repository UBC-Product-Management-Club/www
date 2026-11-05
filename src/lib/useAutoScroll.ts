"use client";

import { useEffect, useRef, type RefObject } from "react";

type Options = {
  active: boolean;
  /** Pixels a second. */
  speed: number;
  /** The width of one copy of a doubled list: the rail then runs forever, jumping back by exactly that much, unseen. */
  loop?: () => number;
  /** Anything else that should hold the rail still for now. */
  hold?: () => boolean;
  /** Without `loop`: called once, `dwell` ms after the rail reaches its end. */
  onEnd?: () => void;
  dwell?: number;
  onProgress?: (share: number) => void;
};

/** How long the rail stays still after a visitor lets go or its momentum stops (ms). */
const RESUME = 1800;

/**
 * Glides a sideways scroller along continuously while it's on screen. A touch, the mouse or keyboard focus takes it
 * over at once, and it carries on from wherever they left it. `restart` starts it afresh when its content changes.
 */
export function useAutoScroll(ref: RefObject<HTMLElement | null>, options: Options, restart?: unknown) {
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });
  const { active } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    let raf = 0, then = performance.now(), pos = el.scrollLeft, atEnd = 0, ended = false;
    let onScreen = false, touching = false, hovering = false, focused = false, restUntil = 0;

    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);

    const touchstart = () => (touching = true);
    const touchend = () => {
      touching = false;
      restUntil = performance.now() + RESUME;
    };
    const enter = (e: PointerEvent) => (hovering = e.pointerType === "mouse");
    const leave = () => (hovering = false);
    const focusin = () => (focused = true);
    const focusout = () => (focused = false);
    const scroll = () => {
      const now = performance.now();
      if (now < restUntil) restUntil = now + RESUME; // still coasting from a swipe
      if (!touching && now >= restUntil) return; // our own step
      const period = opts.current.loop?.() ?? 0; // a swipe past either end of a doubled list carries on round
      if (period <= 0) return;
      if (el.scrollLeft >= period) el.scrollLeft -= period;
      else if (el.scrollLeft <= 0) el.scrollLeft += period;
    };
    el.addEventListener("touchstart", touchstart, { passive: true });
    el.addEventListener("touchend", touchend, { passive: true });
    el.addEventListener("touchcancel", touchend, { passive: true });
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", focusin);
    el.addEventListener("focusout", focusout);
    el.addEventListener("scroll", scroll, { passive: true });

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      const held = touching || hovering || focused || now < restUntil || opts.current.hold?.();
      if (!onScreen || document.hidden || held) {
        pos = el.scrollLeft;
        return;
      }
      const max = el.scrollWidth - el.clientWidth;
      const period = opts.current.loop?.() ?? 0;
      pos += opts.current.speed * dt;
      if (period > 0) {
        if (pos >= period) pos -= period;
      } else if (pos >= max) {
        pos = max;
        atEnd += dt * 1000;
        if (!ended && atEnd >= (opts.current.dwell ?? 0)) {
          ended = true;
          opts.current.onEnd?.();
        }
      }
      el.scrollLeft = pos;
      opts.current.onProgress?.(max > 0 ? pos / max : 1);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("touchstart", touchstart);
      el.removeEventListener("touchend", touchend);
      el.removeEventListener("touchcancel", touchend);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focusin);
      el.removeEventListener("focusout", focusout);
      el.removeEventListener("scroll", scroll);
    };
  }, [ref, active, restart]);
}
