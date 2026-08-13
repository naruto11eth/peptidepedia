import path from "node:path";

import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  turbopack: {
    /*
     * Pin the workspace root. Turbopack otherwise walks up looking for a
     * lockfile, and an unrelated package-lock.json in a parent directory (a
     * stray one in $HOME is common) makes it infer that directory as the root.
     * When that happens Next's internal font modules resolve against the wrong
     * node_modules and dev fails with:
     *   Can't resolve '@vercel/turbopack-next/internal/font/google/font'
     */
    root: path.resolve(import.meta.dirname),
  },
  experimental: {
    // Phosphor ships thousands of icon modules; without this every client
    // bundle that imports one pulls the barrel file.
    optimizePackageImports: ["fuse.js", "@phosphor-icons/react"],
  },
};

export default config;
