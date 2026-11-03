import type { NextConfig } from "next";

// GitHub Pages (staging) builds a static export served under /www; Cloud Run runs the standalone server
const pages = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  output: pages ? "export" : "standalone",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  // partial prerendering can't run in a static export; the page has no server data, so it loses nothing
  cacheComponents: !pages,
  partialPrefetching: !pages,
};

export default nextConfig;
