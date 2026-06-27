import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  },
  transpilePackages: ["@menuflow/shared"],
  reactStrictMode: true
};

export default nextConfig;
