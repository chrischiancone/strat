'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }
  }, [searchParams])
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900">Sign in to your account</h2>
      <p className="mt-2 text-sm text-gray-600">
        Access your strategic planning dashboard
      </p>
      
      {errorMessage && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">
          {errorMessage}
        </div>
      )}
      
      <LoginForm />
    </div>
  )
}
