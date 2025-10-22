import { describe, it, expect, beforeEach } from 'vitest'
import { InputValidator, AuthSecurity, RateLimiter } from '@/lib/security'

describe('InputValidator', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(InputValidator.isValidEmail('test@example.com')).toBe(true)
      expect(InputValidator.isValidEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(InputValidator.isValidEmail('invalid')).toBe(false)
      expect(InputValidator.isValidEmail('@example.com')).toBe(false)
      expect(InputValidator.isValidEmail('test@')).toBe(false)
    })

    it('should reject emails exceeding 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(InputValidator.isValidEmail(longEmail)).toBe(false)
    })
  })

  describe('sanitizeString', () => {
    it('should remove null bytes and control characters', () => {
      const input = 'Hello\x00World\x1F'
      const result = InputValidator.sanitizeString(input)
      expect(result).toBe('HelloWorld')
    })

    it('should trim whitespace', () => {
      const input = '  spaced  '
      const result = InputValidator.sanitizeString(input)
      expect(result).toBe('spaced')
    })

    it('should throw error for inputs exceeding max length', () => {
      const longString = 'a'.repeat(1001)
      expect(() => InputValidator.sanitizeString(longString)).toThrow()
    })
  })

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(InputValidator.isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(InputValidator.isValidUUID('not-a-uuid')).toBe(false)
      expect(InputValidator.isValidUUID('123-456-789')).toBe(false)
    })
  })

  describe('validateNumber', () => {
    it('should validate and return valid numbers', () => {
      expect(InputValidator.validateNumber(42)).toBe(42)
      expect(InputValidator.validateNumber('42')).toBe(42)
    })

    it('should enforce minimum value', () => {
      expect(() => InputValidator.validateNumber(5, { min: 10 })).toThrow()
    })

    it('should enforce maximum value', () => {
      expect(() => InputValidator.validateNumber(15, { max: 10 })).toThrow()
    })

    it('should enforce integer constraint', () => {
      expect(() => InputValidator.validateNumber(3.14, { integer: true })).toThrow()
    })
  })
})

describe('AuthSecurity', () => {
  describe('isWeakPassword', () => {
    it('should reject passwords shorter than 8 characters', () => {
      expect(AuthSecurity.isWeakPassword('Short1!')).toBe(true)
    })

    it('should reject passwords without uppercase letters', () => {
      expect(AuthSecurity.isWeakPassword('lowercase123!')).toBe(true)
    })

    it('should reject passwords without lowercase letters', () => {
      expect(AuthSecurity.isWeakPassword('UPPERCASE123!')).toBe(true)
    })

    it('should reject passwords without numbers', () => {
      expect(AuthSecurity.isWeakPassword('NoNumbers!')).toBe(true)
    })

    it('should reject passwords without special characters', () => {
      expect(AuthSecurity.isWeakPassword('NoSpecial123')).toBe(true)
    })

    it('should reject common weak passwords', () => {
      expect(AuthSecurity.isWeakPassword('Password123!')).toBe(true)
      expect(AuthSecurity.isWeakPassword('Admin123!')).toBe(true)
    })

    it('should accept strong passwords', () => {
      expect(AuthSecurity.isWeakPassword('Str0ng!P@ssw0rd')).toBe(false)
    })
  })
})

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear all rate limit data before each test
    RateLimiter['attempts'].clear()
  })

  it('should not rate limit on first attempt', () => {
    expect(RateLimiter.isRateLimited('test-key', 3, 1)).toBe(false)
  })

  it('should rate limit after max attempts', () => {
    const key = 'test-key'
    
    // First 3 attempts should succeed
    expect(RateLimiter.isRateLimited(key, 3, 1)).toBe(false)
    expect(RateLimiter.isRateLimited(key, 3, 1)).toBe(false)
    expect(RateLimiter.isRateLimited(key, 3, 1)).toBe(false)
    
    // 4th attempt should be rate limited
    expect(RateLimiter.isRateLimited(key, 3, 1)).toBe(true)
  })

  it('should reset rate limit for specific key', () => {
    const key = 'test-key'
    
    RateLimiter.isRateLimited(key, 3, 1)
    RateLimiter.isRateLimited(key, 3, 1)
    RateLimiter.isRateLimited(key, 3, 1)
    
    RateLimiter.reset(key)
    
    // Should not be rate limited after reset
    expect(RateLimiter.isRateLimited(key, 3, 1)).toBe(false)
  })
})
