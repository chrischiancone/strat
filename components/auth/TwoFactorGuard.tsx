import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth-actions'
import { checkTwoFactorRequiredAction } from '@/app/actions/2fa-actions'

interface TwoFactorGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * Server component that enforces 2FA requirements for admin users
 */
export async function TwoFactorGuard({ 
  children, 
  redirectTo = '/profile/security?required=true' 
}: TwoFactorGuardProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const twoFactorRequirement = await checkTwoFactorRequiredAction()

  // If 2FA is required but not completed, redirect to setup
  if (twoFactorRequirement.required && !twoFactorRequirement.hasCompleted) {
    redirect(redirectTo)
  }

  return <>{children}</>
}