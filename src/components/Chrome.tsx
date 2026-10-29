/* eslint-disable @next/next/no-img-element */
import { LINKS, LOGOS, img } from "@/data/site";
import { Discord, Instagram, LinkedIn } from "./icons";

const SOCIAL = [
  { href: LINKS.instagram, label: "Instagram", Icon: Instagram },
  { href: LINKS.linkedin, label: "LinkedIn", Icon: LinkedIn },
  { href: LINKS.discord, label: "Discord", Icon: Discord },
];

export function LogoStrip() {
  return (
    <div className="logos wrap">
      <p id="logos-h">PMC members have worked at</p>
      <div className="track" role="region" aria-labelledby="logos-h">
        <ul>
          {[0, 1].map((d) =>
            LOGOS.map(([n, f]) => (
              <li key={`${d}${n}`} aria-hidden={d ? true : undefined}>
                <img src={img(f, 512)} alt={d ? "" : n} loading="lazy" />
              </li>
            )),
          )}
        </ul>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="fg">
          <div>
            <a className="logo" href="#top">
              <img src="/brand/pmc-logo-96.png" alt="" width="34" height="30" />
              UBC PMC
            </a>
            <p className="foot-line">Canada’s largest product management club, at the University of British Columbia.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="#events">Events</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#offer">What we offer</a></li>
              <li><a href="#team">Team</a></li>
              <li><a href="#advisors">Board of Advisors</a></li>
              <li><a href="#join">Get involved</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={LINKS.connect}>connect@ubcpmc.com</a></li>
              <li><a href={LINKS.partnerships}>partnerships@ubcpmc.com</a></li>
            </ul>
            <ul className="social" aria-label="UBC PMC on social media">
              {SOCIAL.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener" aria-label={label} title={label}>
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="legal">© 2026 UBC Product Management Club</p>
      </div>
    </footer>
  );
}
