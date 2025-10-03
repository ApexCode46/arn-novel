import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ✅ Google login profile images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      // ✅ Local uploads (เวลารัน dev/prod ที่ localhost:3000)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/uploads/**',
      },
      // ✅ ถ้า deploy แล้วเปลี่ยนเป็น domain จริงของคุณ
      // {
      //   protocol: 'https',
      //   hostname: 'your-domain.com',
      //   port: '',
      //   pathname: '/api/uploads/**',
      // }
    ],
  },
};

export default nextConfig;
