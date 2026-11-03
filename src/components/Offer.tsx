/* eslint-disable @next/next/no-img-element */
import { OFFER } from "@/data/site";
import { gearPath } from "@/lib/gear";

const GEAR_D = gearPath(500, 500, 490);

/** Three offerings side by side over a slow brand-light field; the cards rise in one after another as they scroll in. */
export default function Offer() {
  return (
    <section className="offer" id="offer" aria-labelledby="offer-h" data-sky="light">
      <div className="offer-field" aria-hidden="true">
        <i />
        <i />
        <i />
        <b />
        <svg viewBox="0 0 1000 1000">
          <path d={GEAR_D} />
          <circle cx="500" cy="500" r="330" />
        </svg>
      </div>
      <div className="wrap offer-stage">
        <div className="offer-intro">
          <img className="offer-logo" src="/brand/pmc-logo.webp" alt="" width="512" height="445" />
          <div>
            <h2 id="offer-h">What we offer</h2>
            <p className="lede">Helping students explore product through hands-on events and community.</p>
          </div>
        </div>
        <ul className="offer-cards">
          {OFFER.map((o, k) => (
            <li key={o.title} className="offer-card" style={{ "--k": k } as React.CSSProperties}>
              <img src={o.photo.src} alt={o.photo.alt} loading="lazy" decoding="async" />
              <div className="face-copy">
                <h3>{o.title}</h3>
                <p>{o.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
