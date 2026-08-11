import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cover art is the track's own YouTube thumbnail, so the playlist never
    // needs a bundled asset.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
};

export default nextConfig;
