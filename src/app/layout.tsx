import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { asset, BASE } from "@/lib/asset";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const title = "UBC PMC | Canada’s Largest Product Management Club";
const description =
  "UBC Product Management Club: events, mentorship and industry connections for students preparing for product roles. Become a member today.";

export const metadata: Metadata = {
  // share images need a full URL; staging is served from a secret path on the same domain
  metadataBase: new URL("https://ubcpmc.com"),
  title,
  description,
  // a base path means this is the staging build: keep it out of search results (robots.txt would reveal its path)
  ...(BASE && { robots: { index: false, follow: false } }),
  openGraph: { title, description, url: "/", siteName: "UBC PMC", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#fbf9fe",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://framerusercontent.com" />
        <link rel="preload" href={asset("/models/geary.glb")} as="fetch" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
