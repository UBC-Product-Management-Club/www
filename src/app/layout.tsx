import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UBC PMC | Canada’s Largest Product Management Club",
  description:
    "UBC Product Management Club: events, mentorship and industry connections for students preparing for product roles. Become a member today.",
};

export const viewport: Viewport = {
  themeColor: "#fbf9fe",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const CONTRACT = `<!--
THESIS: The club as things you can pick up: a gear to spin, stickers to peel, a badge to swing, a mascot to turn. Refuses the static card-grid club page.
OWN-WORLD: the PMC poster ramp (periwinkle #8b9cf2, lavender #a97fdc, orchid #d25fa6, rose #e4405e) on near-white lavender #fbf9fe, deep ink #1d1838 for the events night scene, Poppins throughout (600/700 display), as on ubcpmc.com, glossy brand-gradient 3D, Geary's silver, navy and orange.
STORY: spin the gear, fall through it into the events, zoom back out to the numbers, meet the people, meet Geary, join.
FIRST VIEWPORT: "Canada’s Largest Product Management Club" with member + volunteer actions, beside a 3D Geary among floating brand gears.
SIGNATURE: scroll dives the camera into Geary's eye, whose pupil becomes the dark events wall; later, the team rides a factory belt past Geary.
-->`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://framerusercontent.com" />
      </head>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
