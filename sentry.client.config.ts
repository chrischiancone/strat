import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  environment: process.env.NODE_ENV || 'development',
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter out errors we don't care about
  beforeSend(event, hint) {
    const error = hint.originalException
    
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Filter out browser extension errors
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message)
      if (
        message.includes('chrome-extension://') ||
        message.includes('moz-extension://') ||
        message.includes('safari-extension://')
      ) {
        return null
      }
    }
    
    // Filter out network errors that are expected
    if (event.exception?.values?.[0]?.type === 'NetworkError') {
      return null
    }
    
    return event
  },
  
  // Set custom tags
  initialScope: {
    tags: {
      'app.version': process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    },
  },
})
