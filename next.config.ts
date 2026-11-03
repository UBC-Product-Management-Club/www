import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a self-contained server.js for the Cloud Run image (see Dockerfile)
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
