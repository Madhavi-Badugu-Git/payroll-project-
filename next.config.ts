import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Base path for subdirectory deployment (both dev and production)
  basePath: '/payroll',
  assetPrefix: '/payroll',

  // Image optimization
  images: {
    domains: ['trinitstechnologies.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Output configuration for standalone deployment
  output: 'standalone',

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev *.clerk.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.clerk.accounts.dev *.clerk.dev; connect-src 'self' *.clerk.accounts.dev *.clerk.dev wss:; frame-src 'self' *.clerk.accounts.dev *.clerk.dev;",
          },
        ],
      },
    ];
  },

  // Redirects for clean URLs
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },

  // Enable static file serving
  trailingSlash: false,

  // Production webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Environment variables for runtime
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
  },
};

export default nextConfig;
