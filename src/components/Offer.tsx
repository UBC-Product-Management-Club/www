/* eslint-disable @next/next/no-img-element */
import { OFFER } from "@/data/site";
import { Stickies } from "./Playthings";
import { asset } from "@/lib/asset";

/** Three offerings side by side; the cards rise in one after another as they scroll in. */
export default function Offer() {
  return (
    <section className="offer" id="offer" aria-labelledby="offer-h">
      <div className="wrap offer-stage">
        <div className="offer-intro">
          <img className="offer-logo" src={asset("/brand/pmc-logo.webp")} alt="" width="512" height="445" />
          <div>
            <h2 id="offer-h">What we offer</h2>
            <p className="lede">Helping students explore product through hands-on events and community.</p>
          </div>
          <Stickies />
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
