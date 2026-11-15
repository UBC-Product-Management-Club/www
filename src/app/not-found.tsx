import type { Metadata } from "next";
import { BASE } from "@/lib/asset";

export const metadata: Metadata = { title: "Page not found | UBC PMC", robots: { index: false } };

/** Old pages from the Framer site, each sent to its section on the home page. Add a line to retire another. */
const RETIRED: Record<string, string> = {
  "/about": "/#about",
  "/events": "/#events",
  "/partners": "/#advisors",
  "/resources": "/",
  "/workshop-day": "/",
  "/coming-soon": "/",
  "/page": "/",
  "/000notavailhome": "/",
  "/page-2": "/",
  "/productchallenge": "/",
  "/productconference-archived": "/",
};

/**
 * GitHub Pages can't redirect, but it serves this page for any path the site doesn't have, so old links are sorted
 * out here, before the page paints: retired pages go to their section, and the old Framer event pages (/product…)
 * go to the events wall.
 */
const redirect = `(function () {
  var base = ${JSON.stringify(BASE)}, retired = ${JSON.stringify(RETIRED)}, path = location.pathname;
  if (base && path.indexOf(base) === 0) path = path.slice(base.length);
  path = path.replace(/\\/+$/, "") || "/";
  if (retired[path]) location.replace(base + retired[path]);
  else if (path.indexOf("/product") === 0) location.replace(base + "/#events");
})();`;

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirect }} />
      <main className="not-found">
        <h1>Page not found</h1>
        <a className="btn primary" href={`${BASE}/`}>
          Back to UBC PMC
        </a>
      </main>
    </>
  );
}
