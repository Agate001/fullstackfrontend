import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://csablobcarlos.blob.core.windows.net',
        pathname: '/csablobcarlos/**',
      }
    ],
  }
};

export default nextConfig;
