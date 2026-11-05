/* eslint-disable @next/next/no-img-element */
import { LINKS } from "@/data/site";
import { Discord, Instagram, LinkedIn } from "./icons";
import { asset } from "@/lib/asset";

const SOCIAL = [
  { href: LINKS.instagram, label: "Instagram", Icon: Instagram },
  { href: LINKS.linkedin, label: "LinkedIn", Icon: LinkedIn },
  { href: LINKS.discord, label: "Discord", Icon: Discord },
];

export function Footer() {
  return (
    <footer className="footer board board-end">
      <div className="wrap">
        <div className="fg">
          <div>
            <a className="logo" href="#top">
              <img src={asset("/brand/pmc-logo-96.png")} alt="" width="34" height="30" />
              UBC PMC
            </a>
            <p className="foot-line">Canada’s largest product management club, at the University of British Columbia.</p>
          </div>
          <div>
            <h3>Explore</h3>
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
            <h3>Contact</h3>
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
