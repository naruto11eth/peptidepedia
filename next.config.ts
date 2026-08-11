import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    // Phosphor ships thousands of icon modules; without this every client
    // bundle that imports one pulls the barrel file.
    optimizePackageImports: ["fuse.js", "@phosphor-icons/react"],
  },
};

export default config;
