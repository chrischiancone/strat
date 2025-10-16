/**
 * Health Check API Endpoint
 * 
 * Provides system health status for monitoring and debugging.
 * Used by monitoring tools, load balancers, and deployment pipelines.
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      latency?: number
      error?: string
    }
    auth: {
      status: 'healthy' | 'unhealthy'
      error?: string
    }
  }
  version?: string
  environment?: string
}

/**
 * GET /api/health
 * 
 * Returns health status of the application and its dependencies
 */
export async function GET() {
  const startTime = Date.now()
  
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: 'healthy',
      },
      auth: {
        status: 'healthy',
      },
    },
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  }

  try {
    // Check database connection
    const supabase = createServerSupabaseClient()
    const dbStartTime = Date.now()
    
    const { error: dbError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .limit(1)

    const dbLatency = Date.now() - dbStartTime

    if (dbError) {
      response.checks.database = {
        status: 'unhealthy',
        latency: dbLatency,
        error: dbError.message,
      }
      response.status = 'unhealthy'
    } else {
      response.checks.database = {
        status: 'healthy',
        latency: dbLatency,
      }
    }

    // Check auth connection
    try {
      const { error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        response.checks.auth = {
          status: 'unhealthy',
          error: authError.message,
        }
        response.status = response.status === 'unhealthy' ? 'unhealthy' : 'degraded'
      }
    } catch (error) {
      response.checks.auth = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
      response.status = response.status === 'unhealthy' ? 'unhealthy' : 'degraded'
    }

  } catch (error) {
    console.error('Health check error:', error)
    
    response.status = 'unhealthy'
    response.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Return appropriate HTTP status code
  const statusCode = response.status === 'healthy' ? 200 : 503

  return NextResponse.json(response, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  })
}

/**
 * HEAD /api/health
 * 
 * Lightweight health check without response body
 */
export async function HEAD() {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()

    return new NextResponse(null, { 
      status: error ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
