import { getCurrentUser } from '@/app/actions/auth-actions'
import { checkTwoFactorRequiredAction, getTwoFactorStatusAction } from '@/app/actions/2fa-actions'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, Lock } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function TwoFactorRequiredPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const [twoFactorStatus, twoFactorRequirement] = await Promise.all([
    getTwoFactorStatusAction(),
    checkTwoFactorRequiredAction()
  ])

  // If 2FA is not required or already completed, redirect to dashboard
  if (!twoFactorRequirement.required || twoFactorRequirement.hasCompleted) {
    redirect('/dashboard')
  }

  const isEnabled = twoFactorStatus.success && twoFactorStatus.isEnabled
  const backupCodesCount = twoFactorStatus.backupCodesCount || 0

  async function handleTwoFactorEnabled() {
    'use server'
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Security Setup Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Complete your account security setup to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="space-y-6">
          {/* Critical Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Access Restricted:</strong> As an administrator, you must enable two-factor authentication 
              before you can access your account. This security measure is required by your organization's policy.
            </AlertDescription>
          </Alert>

          {/* Admin Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Administrator Account
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  2FA Required
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>
                  Your account has been identified as having administrative privileges. 
                  For enhanced security, two-factor authentication is mandatory for all admin accounts.
                </p>
                <p className="mt-2">
                  You cannot proceed until 2FA is properly configured on your account.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2FA Setup */}
          <TwoFactorSetup
            userId={user.id}
            isEnabled={isEnabled}
            backupCodesCount={backupCodesCount}
            onStatusChange={(enabled) => {
              if (enabled) {
                window.location.href = '/dashboard'
              }
            }}
          />

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Why is this required?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>
                Two-factor authentication (2FA) adds an essential security layer that protects 
                your administrative account from unauthorized access, even if your password is compromised.
              </p>
              <p>
                This requirement helps protect sensitive municipal data and ensures compliance 
                with security best practices.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Two-Factor Authentication Required',
  description: 'Complete your security setup to access your admin account.',
}