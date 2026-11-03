import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Upcoming from "@/components/Upcoming";
import About from "@/components/About";
import Offer from "@/components/Offer";
import Team from "@/components/Team";
import Advisors from "@/components/Advisors";
import GetInvolved from "@/components/GetInvolved";
import Nav from "@/components/Nav";
import Seam from "@/components/Seam";
import { Footer } from "@/components/Chrome";

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
        <Seam gears={[{ src: "lav-9", side: "right", at: 6, size: 150, dir: -1 }]} />
        <About />
        <Seam
          gears={[
            { src: "silver-10", side: "left", at: -5, size: 260 },
            { src: "rose-8", side: "right", at: 8, size: 130, dir: -1, lift: 60 },
          ]}
        />
        <Offer />
        <Seam
          gears={[
            { src: "ramp-8", side: "right", at: -4, size: 300, dir: -1 },
            { src: "lav-9", side: "left", at: 10, size: 120, lift: -40 },
          ]}
        />
        <Team />
        <Advisors />
        <Seam
          gears={[
            { src: "ramp-12", side: "right", at: 4, size: 230 },
            { src: "silver-12", side: "left", at: -3, size: 170, dir: -1, lift: 50 },
          ]}
        />
        <GetInvolved />
      </main>
      <Footer />
    </>
  );
}
