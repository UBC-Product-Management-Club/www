"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, type KeyboardEvent } from "react";
import { LINKS, UPCOMING } from "@/data/site";
import { useNow } from "@/lib/clock";
import { asset } from "@/lib/asset";
import { StickerArt } from "./StickerArt";
import { Arrow } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");

/** The calendar date in Vancouver, where the events happen, as YYYY-MM-DD. */
const vanDate = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver" }).format(ms);

export default function Upcoming() {
  const now = useNow();
  const ev = UPCOMING.find((e) => now === null || Date.parse(e.end) > now);
  const [picked, setPicked] = useState<number | null>(null);

  if (!ev) {
    return (
      <section className="upcoming" id="upcoming" aria-labelledby="up-h">
        <div className="wrap up-empty">
          <h2 id="up-h">Up next</h2>
          <p>Next season’s events are on the way. Follow along for the first announcement.</p>
          <a className="btn white" href={LINKS.instagram} target="_blank" rel="noopener">
            Follow on Instagram <Arrow />
          </a>
        </div>
      </section>
    );
  }

  const ms = now === null ? null : Date.parse(ev.start) - now;
  const live = ms !== null && ms <= 0;
  const units =
    ms === null || live
      ? null
      : [
          [Math.floor(ms / 86_400_000), "days"],
          [Math.floor(ms / 3_600_000) % 24, "hours"],
          [Math.floor(ms / 60_000) % 60, "min"],
          [Math.floor(ms / 1000) % 60, "sec"],
        ];

  // until someone picks a day, show the one that's happening today (day 1 before the event starts)
  const today = now === null ? -1 : ev.schedule.findIndex((d) => d.date === vanDate(now));
  const shown = Math.min(picked ?? Math.max(today, 0), ev.schedule.length - 1);
  const tabs = ev.schedule.length > 1;
  const pick = (i: number) => {
    setPicked(i);
    document.getElementById(`up-tab-${i}`)?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const n = ev.schedule.length;
    const to = { ArrowRight: shown + 1, ArrowLeft: shown - 1 + n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    pick(to % n);
  };

  return (
    <section className="upcoming" id="upcoming" aria-labelledby="up-h">
      <div className="wrap up-head">
        <h2 id="up-h">Sign up for our upcoming event</h2>
        <img className="up-geary" src={asset("/scenery/geary-happy.webp")} alt="" width="426" height="440" loading="lazy" />
        <p className="sr">{live ? "Happening now" : "Registration open"}</p>
      </div>
      <div className="wrap up-grid">
        <div className="up-main">
          <h3 className="up-name">{ev.name}</h3>
          <p className="up-meta">
            <time dateTime={ev.start.slice(0, 10)}>{ev.dates}</time>
            <span aria-hidden="true">·</span>
            {ev.tagline}
          </p>
          {!live && <p className="up-starts">Starts in</p>}

          <div className="countdown" role="timer" aria-live="off" aria-label={live ? "Happening now" : `Starts ${ev.dates}`}>
            {live ? (
              <p className="up-live">
                <i aria-hidden="true" /> Happening now
              </p>
            ) : (
              (units ?? [["–", "days"], ["–", "hours"], ["–", "min"], ["–", "sec"]]).map(([v, l]) => (
                <span key={l} className="cd-cell">
                  <b>{typeof v === "number" ? pad(v) : v}</b>
                  <span>{l}</span>
                </span>
              ))
            )}
          </div>

          <div className="ctas">
            <a className="btn white" href={ev.href} target="_blank" rel="noopener">
              Register for {ev.name.replace("Product ", "")} <Arrow />
            </a>
            <a className="btn ghost" href={LINKS.member} target="_blank" rel="noopener">
              Become a member
            </a>
          </div>
        </div>

        <div className="up-side">
          {ev.sticker && (
            <div className="up-chip" aria-hidden="true">
              <StickerArt id={ev.sticker} uid="up-chip" />
            </div>
          )}
          {tabs && (
            <div className="up-days" role="tablist" aria-label="Schedule day" onKeyDown={onKey}>
              {ev.schedule.map((d, i) => (
                <button
                  key={d.day}
                  id={`up-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === shown}
                  aria-controls={`up-sheet-${i}`}
                  tabIndex={i === shown ? 0 : -1}
                  onClick={() => setPicked(i)}
                >
                  Day {i + 1}
                  <span>{d.day.split(",")[0].slice(0, 3)}</span>
                </button>
              ))}
            </div>
          )}
          {/* every day's sheet sits in the same spot; the picked one is pinned up and the rest lift off */}
          <div className="up-sheets">
            {ev.schedule.map((d, i) => (
              <div
                key={d.day}
                id={`up-sheet-${i}`}
                className="up-day"
                data-day={i}
                data-shown={i === shown}
                role={tabs ? "tabpanel" : undefined}
                aria-labelledby={tabs ? `up-tab-${i}` : undefined}
                inert={i !== shown}
              >
                <h4>{d.day}</h4>
                <ol>
                  {d.items.map(([t, what]) => (
                    <li key={t + what}>
                      <time>{t}</time>
                      <span>{what}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
