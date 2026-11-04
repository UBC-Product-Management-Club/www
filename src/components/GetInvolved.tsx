"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { LINKS, LOGOS, img } from "@/data/site";
import GearyStage from "./Geary";
import { Arrow } from "./icons";

/** Keyboard rows, staggered like a real board: five, five, then four and a space bar. */
const ROWS = [LOGOS.slice(0, 5), LOGOS.slice(5, 10), LOGOS.slice(10, 14)];
const SPACE = LOGOS[14];

function Keyboard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<string>(LOGOS[0][0]);

  // the board leans toward the pointer; every key presses down under it
  const tilt = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const b = boardRef.current!;
    b.style.setProperty("--tx", `${(((e.clientY - r.top) / r.height - 0.5) * -8).toFixed(1)}deg`);
    b.style.setProperty("--ty", `${(((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(1)}deg`);
  };
  const flat = () => {
    boardRef.current!.style.setProperty("--tx", "0deg");
    boardRef.current!.style.setProperty("--ty", "0deg");
  };

  const cap = ([name, file]: [string, string], wide = false) => (
    <li key={name} className={`cap${wide ? " wide" : ""}`} onPointerEnter={() => setShown(name)}>
      <span className="cap-top">
        <img src={img(file, 256)} alt={name} loading="lazy" draggable={false} />
      </span>
    </li>
  );

  return (
    <div className="keys">
      <div className="keys-copy">
        <h2 id="keys-h">PMC members have worked at</h2>
        <p className="keys-screen" aria-hidden="true">
          <i />
          <span key={shown}>{shown}</span>
        </p>
      </div>
      <div className="keys-view" onPointerMove={tilt} onPointerLeave={flat}>
        <div className="keys-board" ref={boardRef}>
          <ul aria-labelledby="keys-h">
            {ROWS.map((row) => row.map((l) => cap(l)))}
            <li className="cap mod" aria-hidden="true">
              <span className="cap-top">PMC</span>
            </li>
            {cap(SPACE, true)}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Three ways in, as boarding passes: who it's for, the ask, a line on what you get, and a stub with the action. */
const TICKETS = [
  { gate: "Students", title: "Become a member", body: "Event invites, mentorship and a student network that’s already in the industry.", cta: "Join", href: LINKS.member },
  { gate: "Students", title: "Volunteer with us", body: "Help run our events and build the club from the inside.", cta: "Apply", href: LINKS.volunteer },
  { gate: "Companies & mentors", title: "Partner with PMC", body: "Sponsor an event, speak at one, or mentor our members.", cta: "Email", href: `${LINKS.partnerships}?subject=Partnering%20with%20UBC%20PMC` },
];

export default function GetInvolved() {
  return (
    <section className="join board pink" id="join" aria-labelledby="join-h">
      <div className="wrap">
        <Keyboard />
      </div>
      <div className="wrap join-grid">
        <div className="join-copy">
          <p className="join-kicker">Get involved</p>
          <h2 id="join-h">Launch your product career.</h2>
          <ul className="tickets">
            {TICKETS.map((t, k) => (
              <li key={t.title} style={{ "--k": k } as React.CSSProperties}>
                <a className="ticket" href={t.href}>
                  <span className="ticket-main">
                    <small>{t.gate}</small>
                    <b>{t.title}</b>
                    <span>{t.body}</span>
                  </span>
                  <span className="ticket-stub" aria-hidden="true">
                    <small>PMC</small>
                    <b>{t.cta}</b>
                    <Arrow />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="geary-col">
          <div className="geary-intro">
            <h3>Meet Geary</h3>
            <p>Our mascot and resident product manager. Geary’s eyes follow you; tap Geary to spin the gear.</p>
          </div>
          <GearyStage label="Geary, the PMC mascot, in 3D. Drag or use the arrow keys to turn Geary, plus and minus to zoom, Enter to spin the gear." />
        </div>
      </div>
    </section>
  );
}
