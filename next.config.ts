import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    // Route changes animate through React <ViewTransition> (see app/layout.tsx).
    viewTransition: true,
  },
};

export default nextConfig;
