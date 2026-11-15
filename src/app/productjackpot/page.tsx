import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Jackpot | PMC’s 24-hour product challenge",
  description: "Product Jackpot, UBC PMC’s 24-hour product challenge.",
};

/** The event's site lives in the event-webpages repo; this page keeps it at ubcpmc.com/productjackpot. */
export default function ProductJackpot() {
  return <iframe className="event-frame" src="https://ubc-product-management-club.github.io/event-webpages/" title="Product Jackpot" />;
}
