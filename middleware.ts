import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { SecurityAudit, securityHeaders } from '@/lib/security'
import { logger } from '@/lib/logger'
import { createClient } from '@supabase/supabase-js'
import { securitySettingsSchema } from '@/lib/validations/security'

// Security constants
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100

// In-memory rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

function isRateLimited(clientIP: string, path: string): boolean {
  const key = `${clientIP}:${path}`
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return false
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    SecurityAudit.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      clientIP,
      path,
      count: existing.count,
      maxRequests: MAX_REQUESTS_PER_WINDOW,
    }, 'high')
    return true
  }

  existing.count++
  return false
}

async function getSecuritySettingsEdge() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('municipalities')
      .select('settings')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<{ settings: any }>()
    const existing = (data?.settings?.security as unknown) || undefined
    return securitySettingsSchema.parse(existing)
  } catch (e) {
    logger.warn('Failed to load security settings in middleware, using defaults')
    return securitySettingsSchema.parse(undefined)
  }
}

function detectSuspiciousActivity(request: NextRequest, clientIP: string): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const path = request.nextUrl.pathname
  const query = request.nextUrl.search

  // Check for suspicious patterns
  const suspiciousPatterns = [
    // Path traversal attempts
    /\.\.|\/.\./,
    // SQL injection attempts
    /(?:union|select|insert|update|delete|drop|create|alter)\s/i,
    // XSS attempts
    /<script|javascript:|data:text\/html|<iframe/i,
    // Common attack patterns
    /\b(?:eval|exec|system|passthru|shell_exec)\b/i,
  ]

  const fullUrl = path + query
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(fullUrl))

  if (isSuspicious) {
    SecurityAudit.logSecurityEvent('SUSPICIOUS_REQUEST', {
      clientIP,
      path,
      query,
      userAgent,
      fullUrl: fullUrl.substring(0, 200), // Log first 200 chars only
    }, 'high')
  }

  return isSuspicious
}

async function handleCollaborationAPIAuth(request: NextRequest): Promise<NextResponse | null> {
  // Only apply to collaboration API routes
  if (!request.nextUrl.pathname.startsWith('/api/collaboration/')) {
    return null
  }

  try {
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Create a new request with user ID header
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    
    if (user.email) {
      requestHeaders.set('x-user-email', user.email)
    }

    // Create new request with updated headers
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
    })

    // Continue with the modified request
    return NextResponse.next({
      request: newRequest,
    })
  } catch (error) {
    logger.error('Collaboration API auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add CSP header
  response.headers.set('Content-Security-Policy', securityHeaders.csp)

  // Add other security headers
  Object.entries(securityHeaders.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add additional headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-DNS-Prefetch-Control', 'off')

  return response
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const clientIP = getClientIP(request)
  const path = request.nextUrl.pathname
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // Skip security checks for static files and internal Next.js routes
    if (
      path.startsWith('/_next') ||
      path.startsWith('/favicon') ||
      path.includes('.') && !path.endsWith('.tsx') && !path.endsWith('.ts')
    ) {
      const response = await updateSession(request)
      return addSecurityHeaders(response)
    }

    // Load security settings (once per request)
    const sec = await getSecuritySettingsEdge()

    // IP whitelist enforcement (simple exact match list)
    if (sec.access.ipWhitelistEnabled) {
      const allowed = (sec.access.allowedIPs || []).map(ip => ip.trim()).filter(Boolean)
      if (allowed.length > 0 && !allowed.includes(clientIP)) {
        SecurityAudit.logSecurityEvent('IP_BLOCKED', { clientIP, path }, 'high')
        return new NextResponse('Access restricted by IP policy', { status: 403 })
      }
    }

    // Detect suspicious activity
    if (detectSuspiciousActivity(request, clientIP)) {
      logger.warn('Blocking suspicious request', {
        clientIP,
        path,
        userAgent,
      })
      
      return new NextResponse('Access Denied', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    // Handle collaboration API authentication (temporarily disabled)
    // const collaborationAuthResponse = await handleCollaborationAPIAuth(request)
    // if (collaborationAuthResponse) {
    //   // If auth failed, return error response with security headers
    //   return collaborationAuthResponse.status >= 400 
    //     ? addSecurityHeaders(collaborationAuthResponse)
    //     : collaborationAuthResponse
    // }

    // Apply rate limiting to sensitive endpoints (respect settings)
    const sensitiveEndpoints = ['/api/auth', '/login', '/signup', '/api/collaboration']
    const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => path.startsWith(endpoint))
    
    if (isSensitiveEndpoint && isRateLimited(clientIP, path)) {
      logger.warn('Rate limit exceeded', {
        clientIP,
        path,
        userAgent,
      })
      
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900', // 15 minutes
          },
        }
      )
    }

    // Update session with Supabase middleware
    const response = await updateSession(request)
    const secureResponse = addSecurityHeaders(response)

    // Log request metrics
    const duration = Date.now() - startTime
    if (duration > 1000) { // Log slow requests
      logger.warn('Slow request detected', {
        path,
        duration,
        clientIP,
        userAgent,
      })
    }

    return secureResponse

  } catch (error) {
    logger.error('Middleware error', {
      error,
      path,
      clientIP,
      userAgent,
    })

    SecurityAudit.logSecurityEvent('MIDDLEWARE_ERROR', {
      clientIP,
      path,
      userAgent,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'high')

    // Fail open for non-critical errors, but add security headers
    const response = await updateSession(request)
    return addSecurityHeaders(response)
  }
}

// Clean up rate limit store periodically (only in server environment)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000) // Clean up every 5 minutes
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
