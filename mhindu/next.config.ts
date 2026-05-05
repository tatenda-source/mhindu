import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Repo root is one level above the app; without this Vercel's file-tracing
  // throws a monorepo warning when deploying from mhindu/.
  outputFileTracingRoot: path.join(__dirname, ".."),

  images: {
    // Vercel Image Optimization is active by default; unoptimized: false is
    // the default but stated explicitly to survive a future config audit.
    unoptimized: false,
  },
};

export default nextConfig;
