/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  
  // Output standalone for Docker
  output: 'standalone',
  
  eslint: {
    // Enable ESLint in production builds for quality
    ignoreDuringBuilds: process.env.SKIP_LINT === 'true',
  },
  typescript: {
    // Enable TypeScript checks in production builds for quality
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === 'true',
  },
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

    // Suppress Sentry OpenTelemetry warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
      { module: /node_modules\/require-in-the-middle/ },
      { module: /node_modules\/@prisma\/instrumentation/ },
    ]

    return config
  },
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return []
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    
    const headers = [
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
    ]

    // Add CSP header that allows local Supabase connections in development
    if (isDev) {
      headers.push({
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: blob: https:;
          font-src 'self' data:;
          connect-src 'self' http://127.0.0.1:54321 http://localhost:54321 ws://127.0.0.1:54321 ws://localhost:54321 https:;
          frame-src 'self';
          object-src 'none';
          base-uri 'self';
          form-action 'self';
        `.replace(/\s+/g, ' ').trim()
      })
    } else {
      // Production CSP - more restrictive
      headers.push({
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: blob: https:;
          font-src 'self' data:;
          connect-src 'self' https:;
          frame-src 'self';
          object-src 'none';
          base-uri 'self';
          form-action 'self';
        `.replace(/\s+/g, ' ').trim()
      })
    }

    return [
      {
        source: '/:path*',
        headers,
      },
    ]
  },
}

module.exports = nextConfig
