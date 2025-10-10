import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900">Create your account</h2>
      <p className="mt-2 text-sm text-gray-600">
        Get started with strategic planning
      </p>
      <SignupForm />
    </div>
  )
}
