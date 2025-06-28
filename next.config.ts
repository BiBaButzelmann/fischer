import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/willkommen",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
