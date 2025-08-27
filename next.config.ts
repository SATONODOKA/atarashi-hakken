import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // 一時的にコメントアウト
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
