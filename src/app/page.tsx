import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Upcoming from "@/components/Upcoming";
import About from "@/components/About";
import Offer from "@/components/Offer";
import Team from "@/components/Team";
import Advisors from "@/components/Advisors";
import LifeRail from "@/components/LifeRail";
import GetInvolved from "@/components/GetInvolved";
import Nav from "@/components/Nav";
import { Footer, LogoStrip } from "@/components/Chrome";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <Hero />
      <main id="main">
        <Events />
        <Upcoming />
        <About />
        <Offer />
        <LogoStrip />
        <Team />
        <Advisors />
        <LifeRail />
        <GetInvolved />
      </main>
      <Footer />
    </>
  );
}
