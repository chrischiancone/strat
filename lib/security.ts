/**
 * Security utilities and input validation helpers
 */

import { logger } from './logger'
import { createError } from './errorHandler'

// Input sanitization utilities
export class InputValidator {
  // Email validation with security considerations
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email) && email.length <= 254
  }

  // SQL injection prevention for string inputs
  static sanitizeString(input: string, maxLength = 1000): string {
    if (typeof input !== 'string') {
      throw createError.validation('Input must be a string')
    }

    // Remove null bytes and control characters
    const sanitized = input
      .replace(/\0/g, '') // null bytes
      .replace(/[\x00-\x1F\x7F]/g, '') // control characters
      .trim()

    if (sanitized.length > maxLength) {
      throw createError.validation(`Input exceeds maximum length of ${maxLength} characters`)
    }

    return sanitized
  }

  // XSS prevention for user content
  static sanitizeUserContent(content: string): string {
    const sanitized = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()

    return sanitized
  }

  // UUID validation
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Numeric validation with range checking
  static validateNumber(
    value: unknown,
    options: {
      min?: number
      max?: number
      integer?: boolean
    } = {}
  ): number {
    const num = Number(value)
    
    if (isNaN(num) || !isFinite(num)) {
      throw createError.validation('Value must be a valid number')
    }

    if (options.integer && !Number.isInteger(num)) {
      throw createError.validation('Value must be an integer')
    }

    if (options.min !== undefined && num < options.min) {
      throw createError.validation(`Value must be at least ${options.min}`)
    }

    if (options.max !== undefined && num > options.max) {
      throw createError.validation(`Value must be at most ${options.max}`)
    }

    return num
  }

  // File upload validation
  static validateFileUpload(file: {
    name: string
    size: number
    type: string
  }, options: {
    allowedTypes: string[]
    maxSize: number // in bytes
  }): void {
    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      throw createError.validation(
        `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
      )
    }

    // Check file size
    if (file.size > options.maxSize) {
      const maxSizeMB = Math.round(options.maxSize / (1024 * 1024))
      throw createError.validation(`File size exceeds ${maxSizeMB}MB limit`)
    }

    // Check for dangerous file names
    const dangerousPatterns = [
      /\.\.|\/|\\/, // path traversal
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // windows reserved names
      /[<>:"|?*]/, // invalid filename characters
    ]

    if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
      throw createError.validation('Invalid filename')
    }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>()

  static isRateLimited(
    key: string,
    maxAttempts: number,
    windowMinutes: number
  ): boolean {
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000
    const existing = this.attempts.get(key)

    if (!existing || now > existing.resetTime) {
      // First attempt or window expired
      this.attempts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return false
    }

    if (existing.count >= maxAttempts) {
      logger.warn('Rate limit exceeded', {
        key,
        count: existing.count,
        maxAttempts,
        resetTime: existing.resetTime,
      })
      return true
    }

    // Increment attempt count
    existing.count++
    return false
  }

  static reset(key: string): void {
    this.attempts.delete(key)
  }

  static cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.attempts.entries()) {
      if (now > value.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Authentication security utilities
export class AuthSecurity {
  // Check for common weak passwords
  static isWeakPassword(password: string): boolean {
    const weakPatterns = [
      /^password/i,
      /^123456/,
      /^qwerty/i,
      /^admin/i,
      /^letmein/i,
      /^welcome/i,
    ]

    return (
      password.length < 8 ||
      weakPatterns.some(pattern => pattern.test(password)) ||
      !/[A-Z]/.test(password) || // no uppercase
      !/[a-z]/.test(password) || // no lowercase
      !/[0-9]/.test(password) || // no numbers
      !/[^A-Za-z0-9]/.test(password) // no special characters
    )
  }

  // Generate secure random tokens
  static generateSecureToken(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const array = new Uint8Array(length)
    
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array)
    } else {
      // Node.js fallback
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crypto = require('crypto')
      crypto.randomFillSync(array)
    }

    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }

    return result
  }

  // Session validation
  static validateSession(sessionData: {
    userId: string
    email: string
    role: string
    exp?: number
  }): boolean {
    // Check required fields
    if (!sessionData.userId || !sessionData.email || !sessionData.role) {
      return false
    }

    // Check expiration if provided
    if (sessionData.exp && Date.now() / 1000 > sessionData.exp) {
      return false
    }

    // Validate UUID format for userId
    if (!InputValidator.isValidUUID(sessionData.userId)) {
      return false
    }

    // Validate email format
    if (!InputValidator.isValidEmail(sessionData.email)) {
      return false
    }

    // Validate role
    const validRoles = ['admin', 'finance', 'city_manager', 'department_head', 'staff']
    if (!validRoles.includes(sessionData.role)) {
      return false
    }

    return true
  }
}

// Content Security Policy helpers
export const securityHeaders = {
  // Content Security Policy
  csp: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-inline/eval should be removed in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    process.env.NODE_ENV === 'development' 
      ? "connect-src 'self' http://127.0.0.1:54321 http://localhost:54321 ws://127.0.0.1:54321 ws://localhost:54321 https:"
      : "connect-src 'self' https:",
    "media-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),

  // Additional security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
}

// Security audit helpers
export class SecurityAudit {
  // Check for potential security issues in user input
  static auditUserInput(input: Record<string, unknown>, userId?: string): void {
    const suspiciousPatterns = [
      /script/i,
      /javascript:/i,
      /on\w+\s*=/i, // event handlers
      /data:text\/html/i,
      /<iframe/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
    ]

    for (const [field, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        if (suspiciousPatterns.some(pattern => pattern.test(value))) {
          logger.warn('Suspicious input detected', {
            field,
            userId,
            pattern: 'XSS_ATTEMPT',
            value: value.substring(0, 100), // Log first 100 chars only
          })
        }
      }
    }
  }

  // Log security events
  static logSecurityEvent(
    event: string,
    details: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    logger.warn(`Security Event: ${event}`, {
      ...details,
      severity,
      timestamp: new Date().toISOString(),
    })
  }
}

// Initialize security monitoring
export function initializeSecurityMonitoring(): void {
  if (typeof window !== 'undefined') {
    // Monitor for potential XSS attempts
    const originalConsoleError = console.error
    console.error = function (...args) {
      const message = args.join(' ')
      if (message.includes('Script error') || message.includes('SecurityError')) {
        SecurityAudit.logSecurityEvent('CONSOLE_ERROR', {
          message,
          userAgent: navigator.userAgent,
        })
      }
      originalConsoleError.apply(console, args)
    }

    // Clean up rate limiter periodically
    setInterval(() => {
      RateLimiter.cleanup()
    }, 5 * 60 * 1000) // Every 5 minutes
  }
}