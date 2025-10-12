/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // Disable to prevent CSS loss
    turbo: {
      // Ensure CSS is properly processed
      rules: {
        '*.css': {
          loaders: ['css-loader'],
        },
      },
    },
  },
  // Ensure CSS is not cached aggressively
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable CSS optimization in development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            styles: false,
          },
        },
      }
    }
    return config
  },
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return []
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
