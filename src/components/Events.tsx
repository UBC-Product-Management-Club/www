"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { EVENTS, type EventSticker } from "@/data/site";
import { StickerArt, STICKER_SIZE } from "./StickerArt";
import { useMedia } from "@/lib/motion";
import { asset } from "@/lib/asset";

/** Resting spots on the board (desktop): left %, top %, tilt deg. Three above the title, three below. */
const SPOTS: Record<EventSticker["id"], [number, number, number]> = {
  getaway: [4, 10, -7],
  conference: [41, 7, 3],
  jackpot: [78, 11, 8],
  heist: [9, 64, 6],
  sprint: [44, 68, -4],
  night: [74, 63, -6],
};

/** Rounder stickers need a deeper fold before their edge reaches the corner. */
const PEEL: Partial<Record<EventSticker["id"], number>> = { jackpot: 0.5, conference: 0.5, night: 0.4 };

let topZ = 10;

function Snap({ ev, board }: { ev: EventSticker; board: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const state = useRef({ x: 0, y: 0, start: { x: 0, y: 0, px: 0, py: 0 }, active: false, moved: false });
  const [left, top, tilt] = SPOTS[ev.id];
  const [w, h] = STICKER_SIZE[ev.id];

  const set = (k: string, v: string) => ref.current!.style.setProperty(k, v);
  const onDown = (e: React.PointerEvent) => {
    if (!board || e.button !== 0) return;
    const s = state.current;
    s.active = true;
    s.moved = false;
    s.start = { x: s.x, y: s.y, px: e.clientX, py: e.clientY };
    ref.current!.style.zIndex = String(++topZ);
    ref.current!.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    const el = ref.current!;
    if (!s.active) {
      // the polaroid tips toward the pointer, like a print you're holding up to the light
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      set("--rx", `${(((e.clientY - r.top) / r.height - 0.5) * -16).toFixed(1)}deg`);
      set("--ry", `${(((e.clientX - r.left) / r.width - 0.5) * 20).toFixed(1)}deg`);
      return;
    }
    const dx = e.clientX - s.start.px, dy = e.clientY - s.start.py;
    if (!s.moved && Math.hypot(dx, dy) < 6) return;
    if (!s.moved) el.classList.add("dragging");
    s.moved = true;
    s.x = s.start.x + dx;
    s.y = s.start.y + dy;
    set("--x", `${s.x}px`);
    set("--y", `${s.y}px`);
    set("--lean", `${Math.max(-12, Math.min(12, (e.movementX || 0) * 0.8))}deg`);
  };
  const onUp = () => {
    state.current.active = false;
    ref.current!.classList.remove("dragging");
    set("--lean", "0deg");
  };
  const onLeave = () => {
    set("--rx", "0deg");
    set("--ry", "0deg");
  };
  const onClick = (e: React.MouseEvent) => {
    if (state.current.moved) {
      e.preventDefault();
      state.current.moved = false;
    }
  };

  const style = {
    "--left": `${left}%`,
    "--top": `${top}%`,
    "--tilt": `${tilt}deg`,
    "--w": `${w}px`,
    "--h": `${h}px`,
    "--pf": PEEL[ev.id] ?? 0.3,
  } as React.CSSProperties;

  const body = (
    <>
      <span className="snap-print">
        <span className="snap-photo">
          {ev.poster ? (
            <img src={ev.poster} alt="" loading="lazy" decoding="async" draggable={false} />
          ) : (
            <span className="snap-peek">
              <img src={asset("/scenery/geary-idea.webp")} alt="" loading="lazy" draggable={false} />
              <span>Coming soon</span>
            </span>
          )}
        </span>
        <span className="snap-caption">
          <b>{ev.name}</b>
          <span>{ev.when}</span>
        </span>
      </span>
      <span className="sticker" aria-hidden="true">
        <span className="sticker-face">
          <StickerArt id={ev.id} uid={`${ev.id}-f`} />
        </span>
        <span className="sticker-flap">
          <span className="sticker-back">
            <StickerArt id={ev.id} uid={`${ev.id}-b`} />
          </span>
        </span>
      </span>
    </>
  );

  const common = {
    className: `snap${ev.href ? "" : " soon"}`,
    style,
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: onUp,
    onPointerLeave: onLeave,
    onClick,
  };

  return ev.href ? (
    <a {...common} ref={ref as React.Ref<HTMLAnchorElement>} href={ev.href} aria-label={`${ev.name}, ${ev.when}: ${ev.blurb}. Open the event page`} draggable={false}>
      {body}
    </a>
  ) : (
    <div {...common} ref={ref as React.Ref<HTMLDivElement>} tabIndex={0} role="img" aria-label={`${ev.name}, coming soon`}>
      {body}
    </div>
  );
}

export default function Events() {
  const board = useMedia("(min-width: 1000px) and (pointer: fine)");
  return (
    <section className="events" id="events" aria-labelledby="events-h">
      <div className={`events-board${board ? " is-board" : ""}`}>
        <div className="events-title">
          <h2 id="events-h">Events</h2>
          <p>{board ? "Peel, drag and rearrange. Click a sticker to open its event." : "Our flagship events. Tap a sticker to open its event."}</p>
        </div>
        <div className="snaps">
          {EVENTS.map((ev) => (
            <Snap key={ev.id} ev={ev} board={board} />
          ))}
        </div>
      </div>
    </section>
  );
}
