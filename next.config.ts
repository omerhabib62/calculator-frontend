import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // Enable if you want to deploy to GitHub Pages later
  // output: 'export',
  // trailingSlash: true,
  // images: { unoptimized: true }
  allowedDevOrigins: ['192.168.100.23']
};

export default nextConfig;
