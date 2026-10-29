"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { BOARD, img, type Advisor } from "@/data/site";
import { External } from "./icons";

function Card({ a, k }: { a: Advisor; k: number }) {
  const [flipped, setFlipped] = useState(false);
  const id = `boa-bio-${k}`;
  const off = k - (BOARD.length - 1) / 2; // position in the fan, centre = 0
  return (
    <li className={`boa-card${flipped ? " flipped" : ""}`} style={{ "--off": off, "--arc": Math.abs(off) } as React.CSSProperties}>
      <div className="boa-inner">
        <div className="boa-front" inert={flipped}>
          <span className="boa-photo">
            <img src={img(a.photo, 512)} alt="" loading="lazy" decoding="async" />
          </span>
          <span className="boa-badge">{a.badge}</span>
          <h3>{a.name}</h3>
          <p className="boa-title">{a.title}</p>
          <button type="button" className="boa-flip" aria-controls={id} aria-expanded={flipped} onClick={() => setFlipped(true)}>
            Read bio
          </button>
        </div>
        <div className="boa-back" id={id} inert={!flipped}>
          <h3>{a.name}</h3>
          <p>{a.bio}</p>
          <div className="boa-actions">
            <a href={a.linkedin} target="_blank" rel="noopener">
              LinkedIn <External />
            </a>
            <button type="button" className="boa-flip" onClick={() => setFlipped(false)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Advisors() {
  return (
    <section className="boa" id="advisors" aria-labelledby="boa-h">
      <div className="wrap">
        <div className="boa-head">
          <h2 id="boa-h">Board of Advisors</h2>
          <p className="lede">Meet the industry friends of PMC: product leaders who guide the club.</p>
        </div>
      </div>
      <ul className="boa-deck">
        {BOARD.map((a, k) => (
          <Card key={a.name} a={a} k={k} />
        ))}
      </ul>
    </section>
  );
}
