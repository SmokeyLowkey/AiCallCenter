/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Disable image optimization to fix the issue
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
}

export default nextConfig
