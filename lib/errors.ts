/**
 * Centralized Error Handling
 * 
 * Custom error classes for consistent error handling across the application.
 * All errors include a code for easy identification and HTTP status codes for API responses.
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: unknown
  public readonly timestamp: string

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details)
  }
}

/**
 * Authorization/Permission errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions', details?: unknown) {
    super(message, 'AUTHORIZATION_ERROR', 403, details)
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`
    super(message, 'NOT_FOUND', 404, { resource, id })
  }
}

/**
 * Database errors (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', 500, details)
  }
}

/**
 * External service errors (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, {
      service,
      ...details,
    })
  }
}

/**
 * Rate limit errors (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter })
  }
}

/**
 * Conflict errors (409) - e.g., duplicate resource
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFLICT_ERROR', 409, details)
  }
}

/**
 * Bad request errors (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'BAD_REQUEST', 400, details)
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Convert any error to AppError for consistent handling
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'INTERNAL_ERROR', 500)
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500)
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: unknown): string {
  if (isAppError(error)) {
    return JSON.stringify({
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
      timestamp: error.timestamp,
    }, null, 2)
  }

  if (error instanceof Error) {
    return JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack,
    }, null, 2)
  }

  return String(error)
}

/**
 * Get user-friendly error message
 * Hides sensitive details in production
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isAppError(error)) {
    // Return the error message for known errors
    return error.message
  }

  // For unknown errors, return generic message in production
  if (process.env.NODE_ENV === 'production') {
    return 'An unexpected error occurred. Please try again later.'
  }

  // In development, show the actual error
  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}

/**
 * Handle Supabase/PostgreSQL errors
 */
export function handleDatabaseError(error: any): AppError {
  const code = error?.code
  const message = error?.message || 'Database operation failed'

  switch (code) {
    case '23505': // Unique violation
      return new ConflictError('A record with this data already exists', { code, message })
    
    case '23503': // Foreign key violation
      return new ValidationError('Referenced record does not exist', { code, message })
    
    case '23514': // Check constraint violation
      return new ValidationError('Data does not meet requirements', { code, message })
    
    case '42501': // Insufficient privilege
      return new AuthorizationError('You do not have permission to perform this action', { code, message })
    
    case '42P01': // Undefined table
      return new DatabaseError('Database table not found - please contact support', { code, message })
    
    default:
      return new DatabaseError(message, { code })
  }
}
