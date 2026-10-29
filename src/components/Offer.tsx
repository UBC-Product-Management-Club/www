"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { OFFER } from "@/data/site";
import { easeInOut, range, sectionProgress, useMedia } from "@/lib/motion";

/** Progress through the pinned section → prism turn, in faces (0 … OFFER.length - 1), resting on each face for a while. */
function turnAt(p: number) {
  const t = p * (OFFER.length - 1);
  const step = Math.min(OFFER.length - 2, Math.floor(t));
  return step + easeInOut(range(t - step, 0.3, 0.7));
}

export default function Offer() {
  const sectionRef = useRef<HTMLElement>(null);
  // pinned and turning only when motion is welcome; a plain list otherwise (and before hydration)
  const live = !useMedia("(prefers-reduced-motion: reduce)", true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!live) return;
    const section = sectionRef.current!;
    const prism = section.querySelector<HTMLElement>(".prism")!;
    const logo = section.querySelector<HTMLElement>(".offer-logo")!;
    let raf = 0, visible = false, last = -1;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(section);
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const p = sectionProgress(section);
      if (p === last) return;
      last = p;
      const turn = turnAt(p);
      // the apothem (face / (2·tan 60°)) pushes the prism back so its front face sits on the page
      prism.style.transform = `translateZ(calc(var(--face) * -0.2887)) rotateY(${(-turn * 120).toFixed(2)}deg)`;
      logo.style.transform = `perspective(700px) rotateX(8deg) rotateY(${(-turn * 30).toFixed(2)}deg)`;
      const a = Math.round(turn);
      setActive((x) => (x === a ? x : a));
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      prism.style.removeProperty("transform");
      logo.style.removeProperty("transform");
    };
  }, [live]);

  const go = (k: number) => {
    const s = sectionRef.current!;
    const top = s.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (k / (OFFER.length - 1)) * (s.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <section className={`offer${live ? " is-live" : ""}`} id="offer" ref={sectionRef} aria-labelledby="offer-h">
      <div className="offer-stage wrap">
        <div className="offer-intro">
          <img className="offer-logo" src="/brand/pmc-logo.webp" alt="" width="512" height="445" />
          <h2 id="offer-h">What we offer</h2>
          <p className="lede">Helping students explore product through hands-on events and community.</p>
          {live && (
            <ol className="offer-tabs">
              {OFFER.map((o, k) => (
                <li key={o.title}>
                  <button type="button" aria-current={k === active ? "step" : undefined} onClick={() => go(k)}>
                    {o.title}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="prism-view">
          <ul className="prism">
            {OFFER.map((o, k) => (
              <li key={o.title} className="face" style={{ "--k": k } as React.CSSProperties} aria-hidden={live && k !== active ? true : undefined}>
                <img src={o.photo.src} alt={o.photo.alt} loading="lazy" decoding="async" />
                <div className="face-copy">
                  <h3>{o.title}</h3>
                  <p>{o.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
