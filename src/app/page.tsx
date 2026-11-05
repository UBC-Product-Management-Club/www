import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Upcoming from "@/components/Upcoming";
import About from "@/components/About";
import Offer from "@/components/Offer";
import Team from "@/components/Team";
import Advisors from "@/components/Advisors";
import GetInvolved from "@/components/GetInvolved";
import Nav from "@/components/Nav";
import { Edge, EasterEggs, GearTrain, GearyPop, ShipIt } from "@/components/Playthings";
import { Footer } from "@/components/Chrome";
import ScrollCue from "@/components/ScrollCue";
import { asset } from "@/lib/asset";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <Hero />
      <main id="main">
        {/* the boards: panels laid on the page; small toys sit on their edges */}
        <div className="board board-dive">
          <Events />
          <Upcoming />
        </div>
        <Edge>
          <GearyPop src={asset("/scenery/geary-smirk.webp")} place={{ side: "left", at: 6, lift: -44 }} size={170} />
        </Edge>
        <About />
        <Edge>
          <ShipIt place={{ side: "right", at: 4, lift: 10 }} />
        </Edge>
        <Offer />
        <Edge behind>
          <GearyPop src={asset("/scenery/geary-happy.webp")} place={{ side: "left", at: 9, lift: -6 }} size={190} peek start={1} />
        </Edge>
        <Edge>
          <GearTrain place={{ side: "right", at: 3, lift: -10 }} gears={[{ teeth: 14 }, { teeth: 9, angle: -25 }]} />
        </Edge>
        <div className="board">
          <Team />
        </div>
        <Advisors />
        <GetInvolved />
      </main>
      <Footer />
      <ScrollCue />
      <EasterEggs />
    </>
  );
}
