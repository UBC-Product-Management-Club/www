"use client";

import { useRef } from "react";
import { EVENTS, type EventSticker } from "@/data/site";
import { StickerArt, STICKER_SIZE } from "./StickerArt";
import { useMedia } from "@/lib/motion";

/** Resting spots on the board (desktop): left %, top %, tilt deg. */
const SPOTS: Record<EventSticker["id"], [number, number, number]> = {
  getaway: [4, 7, -7],
  conference: [40, 2, 4],
  jackpot: [77, 9, 11],
  heist: [8, 66, 8],
  sprint: [44, 69, -5],
  night: [71, 67, -6],
};

/** Rounder stickers need a deeper fold before their edge reaches the corner. */
const PEEL: Partial<Record<EventSticker["id"], number>> = { jackpot: 0.5, sprint: 0.46, night: 0.42 };

let topZ = 10;

function Sticker({ ev, draggable }: { ev: EventSticker; draggable: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const state = useRef({ x: 0, y: 0, start: { x: 0, y: 0, px: 0, py: 0 }, active: false, moved: false });
  const [left, top, tilt] = SPOTS[ev.id];
  const [w, h] = STICKER_SIZE[ev.id];

  const onDown = (e: React.PointerEvent) => {
    if (!draggable || e.button !== 0) return;
    const s = state.current;
    s.active = true;
    s.moved = false;
    s.start = { x: s.x, y: s.y, px: e.clientX, py: e.clientY };
    ref.current!.style.zIndex = String(++topZ);
    ref.current!.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.active) return;
    const dx = e.clientX - s.start.px, dy = e.clientY - s.start.py;
    if (!s.moved && Math.hypot(dx, dy) < 6) return;
    if (!s.moved) ref.current!.classList.add("dragging");
    s.moved = true;
    s.x = s.start.x + dx;
    s.y = s.start.y + dy;
    ref.current!.style.setProperty("--x", `${s.x}px`);
    ref.current!.style.setProperty("--y", `${s.y}px`);
    ref.current!.style.setProperty("--lean", `${Math.max(-12, Math.min(12, (e.movementX || 0) * 0.8))}deg`);
  };
  const onUp = () => {
    state.current.active = false;
    ref.current!.classList.remove("dragging");
    ref.current!.style.setProperty("--lean", "0deg");
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
      <span className="sticker-face">
        <StickerArt id={ev.id} uid={`${ev.id}-f`} />
      </span>
      <span className="sticker-flap" aria-hidden="true">
        <span className="sticker-back">
          <StickerArt id={ev.id} uid={`${ev.id}-b`} />
        </span>
      </span>
      <span className="sticker-tag">
        <b>{ev.when}</b> <span className="tag-blurb">{ev.blurb}</span>
      </span>
    </>
  );

  const common = {
    className: `sticker${ev.href ? "" : " soon"}`,
    style,
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: onUp,
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
  const board = useMedia("(min-width: 960px) and (pointer: fine)");
  return (
    <section className="events" id="events" aria-labelledby="events-h">
      <div className={`events-board${board ? " is-board" : ""}`}>
        <div className="events-title">
          <h2 id="events-h">Events</h2>
          <p>
            {board ? "Peel, drag and rearrange. Click a sticker to open its event." : "Our flagship events. Tap a sticker to open its event."}
          </p>
        </div>
        <div className="stickers">
          {EVENTS.map((ev) => (
            <Sticker key={ev.id} ev={ev} draggable={board} />
          ))}
        </div>
      </div>
    </section>
  );
}
