import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
    experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
    api: {
    bodyParser: {
      sizeLimit: '7mb', // Adjust based on your max file size (5MB + buffer)
    },
    responseLimit: '9mb', // Slightly higher than bodyParser limit
  },
};

module.exports = nextConfig;