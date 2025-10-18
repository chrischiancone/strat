import { describe, it, expect } from 'vitest'
import { createError, handleError, AppErrorClass } from '@/lib/errorHandler'

describe('Error Handler', () => {
  describe('createError factory', () => {
    it('should create database error with correct properties', () => {
      const error = createError.database('Connection failed')
      
      expect(error).toBeInstanceOf(AppErrorClass)
      expect(error.type).toBe('DATABASE_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.retryable).toBe(true)
      expect(error.userMessage).toContain('database error')
    })

    it('should create authentication error with correct properties', () => {
      const error = createError.auth('Invalid credentials')
      
      expect(error.type).toBe('AUTHENTICATION_ERROR')
      expect(error.statusCode).toBe(401)
      expect(error.retryable).toBe(false)
    })

    it('should create validation error with correct properties', () => {
      const error = createError.validation('Invalid email format')
      
      expect(error.type).toBe('VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.retryable).toBe(false)
    })

    it('should create not found error with correct properties', () => {
      const error = createError.notFound('User')
      
      expect(error.type).toBe('NOT_FOUND_ERROR')
      expect(error.statusCode).toBe(404)
      expect(error.message).toContain('User not found')
    })
  })

  describe('handleError.server', () => {
    it('should return formatted error response', async () => {
      const error = createError.database('Query failed')
      const result = await handleError.server(error, { action: 'fetchUsers' })
      
      expect(result).toEqual({
        success: false,
        error: expect.any(String),
      })
      expect(result.error).toContain('database error')
    })

    it('should handle unknown errors gracefully', async () => {
      const result = await handleError.server(new Error('Unknown error'))
      
      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred',
      })
    })
  })

  describe('handleError.client', () => {
    it('should return user-friendly error message', () => {
      const error = createError.authorization('Access denied')
      const message = handleError.client(error)
      
      expect(message).toBe('You do not have permission to perform this action.')
    })
  })

  describe('handleError.validation', () => {
    it('should return validation error details', () => {
      const error = createError.validation('Email is required', undefined, { field: 'email' })
      const result = handleError.validation(error)
      
      expect(result).toHaveProperty('message')
      expect(result.field).toBe('email')
    })
  })

  describe('AppErrorClass', () => {
    it('should preserve error stack trace when caused by another error', () => {
      const originalError = new Error('Original error')
      const appError = new AppErrorClass(
        'Wrapped error',
        'DATABASE_ERROR',
        { cause: originalError }
      )
      
      expect(appError.stack).toBe(originalError.stack)
    })

    it('should allow custom user messages', () => {
      const error = new AppErrorClass(
        'Technical error',
        'UNKNOWN_ERROR',
        { userMessage: 'Something went wrong' }
      )
      
      expect(error.message).toBe('Technical error')
      expect(error.userMessage).toBe('Something went wrong')
    })
  })
})
