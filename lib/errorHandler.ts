/**
 * Centralized error handling system for the Strategic Planning application
 */

import { logger, LogContext } from './logger'
import * as Sentry from '@sentry/nextjs'

export type ErrorType = 
  | 'DATABASE_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export interface AppError extends Error {
  type: ErrorType
  code?: string
  statusCode?: number
  context?: LogContext
  userMessage?: string
  retryable?: boolean
}

export class AppErrorClass extends Error implements AppError {
  public type: ErrorType
  public code?: string
  public statusCode?: number
  public context?: LogContext
  public userMessage?: string
  public retryable?: boolean

  constructor(
    message: string,
    type: ErrorType = 'UNKNOWN_ERROR',
    options: {
      code?: string
      statusCode?: number
      context?: LogContext
      userMessage?: string
      retryable?: boolean
      cause?: Error
    } = {}
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.code = options.code
    this.statusCode = options.statusCode
    this.context = options.context
    this.userMessage = options.userMessage
    this.retryable = options.retryable

    if (options.cause) {
      this.stack = options.cause.stack
    }
  }
}

// Error factory functions
export const createError = {
  database: (message: string, cause?: Error, context?: LogContext): AppError => 
    new AppErrorClass(message, 'DATABASE_ERROR', {
      statusCode: 500,
      userMessage: 'A database error occurred. Please try again later.',
      retryable: true,
      cause,
      context,
    }),

  auth: (message: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(message, 'AUTHENTICATION_ERROR', {
      statusCode: 401,
      userMessage: 'Authentication failed. Please log in again.',
      retryable: false,
      cause,
      context,
    }),

  authorization: (message: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(message, 'AUTHORIZATION_ERROR', {
      statusCode: 403,
      userMessage: 'You do not have permission to perform this action.',
      retryable: false,
      cause,
      context,
    }),

  validation: (message: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(message, 'VALIDATION_ERROR', {
      statusCode: 400,
      userMessage: 'Invalid input data. Please check your input and try again.',
      retryable: false,
      cause,
      context,
    }),

  notFound: (resource: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(`${resource} not found`, 'NOT_FOUND_ERROR', {
      statusCode: 404,
      userMessage: `The requested ${resource.toLowerCase()} was not found.`,
      retryable: false,
      cause,
      context,
    }),

  network: (message: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(message, 'NETWORK_ERROR', {
      statusCode: 500,
      userMessage: 'Network error occurred. Please check your connection and try again.',
      retryable: true,
      cause,
      context,
    }),

  server: (message: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(message, 'UNKNOWN_ERROR', {
      statusCode: 500,
      userMessage: 'A server error occurred. Please try again later.',
      retryable: true,
      cause,
      context,
    }),

  forbidden: (message: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(message, 'AUTHORIZATION_ERROR', {
      statusCode: 403,
      userMessage: 'Access forbidden.',
      retryable: false,
      cause,
      context,
    }),

  gone: (message: string, cause?: Error, context?: LogContext): AppError =>
    new AppErrorClass(message, 'UNKNOWN_ERROR', {
      statusCode: 410,
      userMessage: 'The requested resource is no longer available.',
      retryable: false,
      cause,
      context,
    }),
}

// Error handler functions
export const handleError = {
  // For server actions and API routes
  async server(error: unknown, context?: LogContext): Promise<{ success: false; error: string }> {
    const appError = normalizeError(error)
    
    logger.error(appError.message, {
      ...context,
      ...appError.context,
      errorType: appError.type,
      statusCode: appError.statusCode,
    }, appError)

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(appError, {
        level: appError.statusCode && appError.statusCode < 500 ? 'warning' : 'error',
        tags: {
          errorType: appError.type,
          statusCode: appError.statusCode,
        },
        contexts: {
          custom: {
            ...context,
            ...appError.context,
          },
        },
      })
    }

    return {
      success: false,
      error: appError.userMessage || 'An unexpected error occurred',
    }
  },

  // For client-side components
  client(error: unknown, context?: LogContext): string {
    const appError = normalizeError(error)
    
    logger.error(appError.message, {
      ...context,
      ...appError.context,
      errorType: appError.type,
      location: 'client',
    }, appError)

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(appError, {
        level: appError.statusCode && appError.statusCode < 500 ? 'warning' : 'error',
        tags: {
          errorType: appError.type,
          location: 'client',
        },
        contexts: {
          custom: {
            ...context,
            ...appError.context,
          },
        },
      })
    }

    return appError.userMessage || 'An unexpected error occurred'
  },

  // For form validations
  validation(error: unknown, context?: LogContext): { field?: string; message: string } {
    const appError = normalizeError(error)
    
    if (appError.type !== 'VALIDATION_ERROR') {
      logger.warn('Non-validation error handled as validation error', {
        ...context,
        actualErrorType: appError.type,
      })
    }

    logger.info(appError.message, {
      ...context,
      ...appError.context,
      errorType: 'VALIDATION_ERROR',
    })

    return {
      field: appError.context?.field as string,
      message: appError.userMessage || 'Invalid input',
    }
  },
}

// Utility functions
function normalizeError(error: unknown): AppError {
  if (error instanceof AppErrorClass) {
    return error
  }

  if (error instanceof Error) {
    // Handle common Supabase errors
    if (error.message.includes('JWT')) {
      return createError.auth('Session expired', error)
    }

    if (error.message.includes('Row not found') || error.message.includes('not found')) {
      return createError.notFound('Resource', error)
    }

    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return createError.validation('Duplicate entry', error)
    }

    if (error.message.includes('foreign key') || error.message.includes('constraint')) {
      return createError.database('Database constraint error', error)
    }

    // Generic error wrapper
    return new AppErrorClass(error.message, 'UNKNOWN_ERROR', {
      statusCode: 500,
      userMessage: 'An unexpected error occurred',
      cause: error,
    })
  }

  // Handle string errors or other types
  const message = typeof error === 'string' ? error : 'Unknown error occurred'
  return new AppErrorClass(message, 'UNKNOWN_ERROR', {
    statusCode: 500,
    userMessage: 'An unexpected error occurred',
  })
}

// Async wrapper for better error handling
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: LogContext
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw normalizeError(error)
    }
  }
}

// Result type for operations that might fail
export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E }

export function createResult<T>(data: T): Result<T> {
  return { success: true, data }
}

export function createErrorResult<E = string>(error: E): Result<never, E> {
  return { success: false, error }
}

// Safe async function wrapper that returns Result type
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: LogContext
): Promise<Result<T, string>> {
  try {
    const data = await fn()
    return createResult(data)
  } catch (error) {
    const handled = await handleError.server(error, context)
    return createErrorResult(handled.error)
  }
}