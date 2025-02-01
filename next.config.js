/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lapislabs.dev',
        pathname: '/images/**',
      },
    ],
  },
}

module.exports = nextConfig 