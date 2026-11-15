"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { LINKS } from "@/data/site";
import { asset } from "@/lib/asset";

const ITEMS = [
  ["#events", "Events"],
  ["#about", "About"],
  ["#team", "Team"],
  ["#join", "Get involved"],
] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [here, setHere] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // scroll-spy: the link for the section under the top third of the screen lights up; sections between
  // two nav targets (What we offer, Advisors) belong to the one above them
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const line = window.innerHeight * 0.34;
      let on: string | null = null;
      for (const [href] of ITEMS) {
        const el = document.querySelector(href);
        if (el && el.getBoundingClientRect().top <= line) on = href;
      }
      setHere(on);
    };
    const onScroll = () => (raf ||= requestAnimationFrame(check));
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const away = (e: PointerEvent) => !navRef.current!.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", esc);
    document.addEventListener("pointerdown", away);
    return () => {
      document.removeEventListener("keydown", esc);
      document.removeEventListener("pointerdown", away);
    };
  }, [open]);

  return (
    <nav aria-label="Primary" className={`nav${open ? " open" : ""}`} ref={navRef}>
      <a className="logo" href="#top" onClick={() => setOpen(false)}>
        <img src={asset("/brand/pmc-logo-96.png")} alt="" width="30" height="26" />
        UBC PMC
      </a>
      <div className="nav-links" id="nav-links">
        {ITEMS.map(([href, label]) => (
          <a
            key={href}
            className="l"
            href={href}
            aria-current={here === href ? "location" : undefined}
            onClick={() => {
              setOpen(false);
              setHere(href);
            }}
          >
            {label}
          </a>
        ))}
      </div>
      <a className="btn primary sm" href={LINKS.member} target="_blank" rel="noopener">
        Portal
      </a>
      <button
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="nav-links"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
    </nav>
  );
}
