import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // <-- disables ESLint during `next build`
  },
};

export default nextConfig;