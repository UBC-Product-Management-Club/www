"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { LINKS } from "@/data/site";

const ITEMS = [
  ["#events", "Events"],
  ["#about", "About"],
  ["#offer", "What we offer"],
  ["#team", "Team"],
  ["#advisors", "Advisors"],
  ["#join", "Get involved"],
] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.documentElement.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", esc);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  return (
    <nav aria-label="Primary" className={`nav${open ? " open" : ""}`}>
      <a className="logo" href="#top" onClick={() => setOpen(false)}>
        <img src="/brand/pmc-logo-96.png" alt="" width="30" height="26" />
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
        Join the club
      </a>
      <button
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
