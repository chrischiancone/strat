'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/app/actions/auth'
import { InputValidator } from '@/lib/security'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})

  // Client-side validation
  function validateInput(email: string, password: string) {
    const errors: { email?: string; password?: string } = {}
    
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!InputValidator.isValidEmail(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    return errors
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setValidationErrors({})

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Client-side validation
    const errors = validateInput(email, password)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      const result = await signIn(formData)

      if (result?.error) {
        // Check for rate limiting message
        if (result.error.includes('Too many login attempts')) {
          setError(result.error)
        } else if (result.error.includes('Invalid login credentials') || 
                  result.error.includes('Email not confirmed')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(result.error)
        }
        setLoading(false)
      } else if (result?.success) {
        // Clear any existing errors on success
        setError(null)
        setValidationErrors({})
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Clear validation errors when user starts typing
  useEffect(() => {
    const inputs = document.querySelectorAll('input')
    const handleInputChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (validationErrors[target.name as keyof typeof validationErrors]) {
        setValidationErrors(prev => ({
          ...prev,
          [target.name]: undefined
        }))
      }
    }

    inputs.forEach(input => {
      input.addEventListener('input', handleInputChange)
    })

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('input', handleInputChange)
      })
    }
  }, [validationErrors])

  return (
    <form action={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={validationErrors.email ? 'true' : 'false'}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
            validationErrors.email
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {validationErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {validationErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={validationErrors.password ? 'true' : 'false'}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
            validationErrors.password
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {validationErrors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
            {validationErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || Object.keys(validationErrors).length > 0}
        aria-describedby="submit-button-description"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <p id="submit-button-description" className="sr-only">
        Click to sign in to your account
      </p>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </a>
      </p>
    </form>
  )
}
