import { LINKS } from "@/data/site";
import GearyStage from "./Geary";
import { Arrow } from "./icons";

export default function GetInvolved() {
  return (
    <section className="join" id="join" aria-labelledby="join-h">
      <div className="join-glow" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="wrap join-grid">
        <div className="join-copy">
          <h2 id="join-h">Launch your product career.</h2>
          <p className="lede">Get event invites, mentorship and a student network that’s already in the industry.</p>
          <div className="ctas">
            <a className="btn white" href={LINKS.member}>
              Become a member <Arrow />
            </a>
            <a className="btn ghost" href={LINKS.volunteer}>
              Volunteer with us
            </a>
          </div>
          <p className="partner">
            <span>For companies and mentors:</span>
            <a href={`${LINKS.partnerships}?subject=Sponsoring%20UBC%20PMC`}>Sponsor PMC</a>
            <a href={`${LINKS.partnerships}?subject=Speaking%20at%20a%20UBC%20PMC%20event`}>Speak at an event</a>
            <a href={LINKS.partnerships}>partnerships@ubcpmc.com</a>
          </p>
        </div>

        <div className="geary-col">
          <div className="geary-intro">
            <h3>Meet Geary</h3>
            <p>Our mascot and resident product manager. Geary’s eyes follow you; tap Geary to spin the gear.</p>
          </div>
          <GearyStage label="Geary, the PMC mascot, in 3D. Drag or use the arrow keys to turn Geary, plus and minus to zoom, Enter to spin the gear." />
        </div>
      </div>
    </section>
  );
}
