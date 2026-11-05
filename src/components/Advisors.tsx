"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { BOARD, img, type Advisor } from "@/data/site";
import { useMedia } from "@/lib/motion";
import { useAutoScroll } from "@/lib/useAutoScroll";
import { External } from "./icons";

/** How fast the hand drifts along on tablets and phones (px/s): slow enough to read as it passes. */
const DRIFT = 42;

/** `echo` is the second copy that makes the loop endless: hidden from assistive tech and the tab order, still tappable. */
function Card({ a, k, echo }: { a: Advisor; k: number; echo?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const id = `boa-bio-${k}${echo ? "-echo" : ""}`;
  const off = k - (BOARD.length - 1) / 2; // position in the fan, centre = 0
  const tab = echo ? -1 : undefined;
  return (
    <li
      className={`boa-card${flipped ? " flipped" : ""}${echo ? " echo" : ""}`}
      style={{ "--off": off, "--arc": Math.abs(off) } as React.CSSProperties}
      aria-hidden={echo || undefined}
    >
      <div className="boa-inner">
        <div className="boa-front" inert={flipped}>
          <span className="boa-photo">
            <img src={img(a.photo, 512)} alt="" loading="lazy" decoding="async" />
          </span>
          <span className="boa-badge">{a.badge}</span>
          <h3>{a.name}</h3>
          <p className="boa-title">{a.title}</p>
          <button type="button" className="boa-flip" tabIndex={tab} aria-controls={id} aria-expanded={flipped} onClick={() => setFlipped(true)}>
            Read bio
          </button>
        </div>
        <div className="boa-back" id={id} inert={!flipped}>
          <h3>{a.name}</h3>
          <p>{a.bio}</p>
          <div className="boa-actions">
            <a href={a.linkedin} target="_blank" rel="noopener" tabIndex={tab}>
              LinkedIn <External />
            </a>
            <button type="button" className="boa-flip" tabIndex={tab} onClick={() => setFlipped(false)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Advisors() {
  const deck = useRef<HTMLUListElement>(null);
  const drifting = useMedia("(max-width: 1100px) and (prefers-reduced-motion: no-preference)");
  useAutoScroll(deck, {
    active: drifting,
    speed: DRIFT,
    // the distance from the first card to its copy: one whole lap, so Tim follows Kasey with no jump
    loop: () => {
      const cards = deck.current!.children as HTMLCollectionOf<HTMLElement>;
      return cards[BOARD.length].offsetLeft - cards[0].offsetLeft;
    },
    hold: () => !!deck.current!.querySelector(".flipped"), // someone's reading a bio
  });

  return (
    <section className="boa" id="advisors" aria-labelledby="boa-h">
      <div className="wrap">
        <div className="boa-head">
          <h2 id="boa-h">Board of Advisors</h2>
          <p className="lede">Meet the industry friends of PMC: product leaders who guide the club.</p>
        </div>
      </div>
      <ul className="boa-deck" ref={deck}>
        {BOARD.map((a, k) => (
          <Card key={a.name} a={a} k={k} />
        ))}
        {BOARD.map((a, k) => (
          <Card key={`${a.name}-echo`} a={a} k={k} echo />
        ))}
      </ul>
    </section>
  );
}
