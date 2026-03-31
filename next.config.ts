import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '.',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  async rewrites() {
    const apiTarget = process.env.VITE_PROXY_TARGET || 'https://localhost:44377';
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
