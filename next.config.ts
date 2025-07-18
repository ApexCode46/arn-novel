import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { // <--- remotePatterns must be inside the 'images' object
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
};

export default nextConfig;