import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent browser from caching HTML pages (important for payment redirects)
  // Static assets (_next/static) are already immutable-cached by Next.js
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
