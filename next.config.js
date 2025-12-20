const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,

  // Enable standalone output for Docker deployments (only in production)
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),

  // Performance optimizations
  swcMinify: true,

  // Faster builds in development
  ...(process.env.NODE_ENV === 'development' && {
    compiler: {
      removeConsole: false,
    },
  }),

  // Reduce memory usage and improve build speed
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config, { isServer }) => {
      // Reduce memory usage
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }

      // Speed up builds by ignoring source maps in development
      config.devtool = 'eval-cheap-module-source-map'

      // Disable webpack cache in development to prevent stale builds
      config.cache = false

      return config
    },
  }),

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
    // Turbopack is faster but still experimental
    // turbo: {},
  },

  // Security headers (also configured in middleware.ts)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
