"use client";

import { useSyncExternalStore } from "react";
import { LINKS, UPCOMING } from "@/data/site";
import { StickerArt } from "./StickerArt";
import { Arrow } from "./icons";

/** A once-a-second clock that is null on the server, so the countdown never mismatches during hydration. */
const clock = {
  subscribe(cb: () => void) {
    const t = window.setInterval(cb, 1000);
    return () => window.clearInterval(t);
  },
  now: () => Math.floor(Date.now() / 1000) * 1000,
  server: () => null,
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function Upcoming() {
  const now = useSyncExternalStore(clock.subscribe, clock.now, clock.server);
  const ev = UPCOMING.find((e) => now === null || Date.parse(e.end) > now);

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

  return (
    <section className="upcoming" id="upcoming" aria-labelledby="up-h">
      <div className="wrap up-grid">
        <div className="up-main">
          <h2 id="up-h" className="up-name">
            <span className="sr">Up next: </span>
            {ev.name}
          </h2>
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
            <a className="btn white" href={ev.href}>
              Register for {ev.name.replace("Product ", "")} <Arrow />
            </a>
            <a className="btn ghost" href={LINKS.member}>
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
          {ev.schedule.map((d) => (
            <div key={d.day} className="up-day">
              <h4>{d.day}</h4>
              <ol>
                {d.items.map(([t, what]) => (
                  <li key={t}>
                    <time>{t}</time>
                    <span>{what}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
