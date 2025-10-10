import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900">Sign in to your account</h2>
      <p className="mt-2 text-sm text-gray-600">
        Access your strategic planning dashboard
      </p>
      <LoginForm />
    </div>
  )
}
