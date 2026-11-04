import type { NextConfig } from "next";

// GitHub Pages (staging) builds a static export served under /www; Cloud Run runs the standalone server.
// configure-pages sets GITHUB_PAGES=true, so any Pages workflow gets the export even without NEXT_OUTPUT.
const pages = process.env.NEXT_OUTPUT === "export" || process.env.GITHUB_PAGES === "true";

// A project site lives at /<repo>; a <owner>.github.io repo is served from the root.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const guessed = pages && repo && !repo.endsWith(".github.io") ? `/${repo}` : "";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? guessed).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: pages ? "export" : "standalone",
  basePath: basePath || undefined,
  // the one base path, handed to the client so plain file URLs (images, the Geary model) match Next's own routes
  env: { SITE_BASE_PATH: basePath },
  // partial prerendering can't run in a static export; the page has no server data, so it loses nothing
  cacheComponents: !pages,
  partialPrefetching: !pages,
};

export default nextConfig;
