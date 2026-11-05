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
  const navRef = useRef<HTMLElement>(null);

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
          <a key={href} className="l" href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </div>
      <a className="btn primary sm" href={LINKS.member}>
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
