import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "**.rawg.io",
      },
    ],
  },
};

export default nextConfig;
