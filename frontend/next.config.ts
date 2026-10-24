import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

function resolveBackendRewriteTarget(): string {
  for (const raw of [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    "http://localhost:4001",
  ]) {
    const value = raw?.trim().replace(/\/$/, "") ?? "";
    if (/^https?:\/\//i.test(value)) {
      return `${value}/:path*`;
    }
  }
  return "http://localhost:4001/:path*";
}

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: resolveBackendRewriteTarget(),
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "s3-instructor-bucket.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
