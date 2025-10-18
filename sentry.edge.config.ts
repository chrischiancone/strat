import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  debug: false,
  
  environment: process.env.NODE_ENV || 'development',
  
  // Set custom tags
  initialScope: {
    tags: {
      'app.version': process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      runtime: 'edge',
    },
  },
})
