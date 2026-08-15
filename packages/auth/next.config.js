/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['chart.googleapis.com'],
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
