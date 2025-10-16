/**
 * Environment Variables Validation
 * 
 * This module validates all required environment variables at runtime
 * to catch configuration issues early in development and production.
 */

import { z } from 'zod'

/**
 * Schema for environment variables
 * - Required variables will cause app to fail startup if missing
 * - Optional variables can be undefined
 */
const envSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Application (Required)
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),

  // AI Integration (Optional)
  PPLX_API_KEY: z.string().optional(),
  PPLX_MODEL: z.string().default('sonar'),
  CLAUDE_API_KEY: z.string().optional(),
  CLAUDE_MODEL: z.string().default('claude-sonnet-4-5-20250929'),

  // Feature Flags (Optional)
  NEXT_PUBLIC_ENABLE_COLLABORATION: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  NEXT_PUBLIC_ENABLE_AI: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform(val => val === 'true')
    .default('false'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

/**
 * Validated environment variables
 * Throws an error if validation fails
 */
export const env = (() => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n')

      console.error('❌ Invalid environment variables:\n' + missingVars)
      console.error('\n💡 Check your .env.local file and compare with .env.example')
      
      // In development, provide helpful error
      if (process.env.NODE_ENV === 'development') {
        throw new Error(
          'Environment validation failed. Please check your .env.local file.\n' +
          'See .env.example for required variables.'
        )
      }
      
      // In production, fail immediately
      throw new Error('Environment validation failed')
    }
    throw error
  }
})()

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>

/**
 * Helper to check if a feature is enabled
 */
export const features = {
  collaboration: env.NEXT_PUBLIC_ENABLE_COLLABORATION,
  ai: env.NEXT_PUBLIC_ENABLE_AI,
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
} as const

/**
 * Helper to check environment
 */
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
