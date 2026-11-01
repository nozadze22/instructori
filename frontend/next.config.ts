import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /** Dev: allow localhost and 127.0.0.1 so HMR + Maps match production behavior. */
  allowedDevOrigins: ["localhost", "127.0.0.1"],
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
