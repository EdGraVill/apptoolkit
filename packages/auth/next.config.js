/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['chart.googleapis.com'],
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
