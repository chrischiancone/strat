'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  TwoFactorStatusResult, 
  TwoFactorToggleResult 
} from '@/app/actions/2fa-actions'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface ProfileSecurityContentProps {
  user: User
  twoFactorStatus: TwoFactorStatusResult
  twoFactorRequirement: {
    required: boolean
    isAdmin: boolean
    hasCompleted: boolean
  }
}

export function ProfileSecurityContent({
  user,
  twoFactorStatus: initialTwoFactorStatus,
  twoFactorRequirement
}: ProfileSecurityContentProps) {
  const [twoFactorStatus, setTwoFactorStatus] = useState(initialTwoFactorStatus)

  function handleTwoFactorStatusChange(enabled: boolean) {
    setTwoFactorStatus(prev => ({
      ...prev,
      isEnabled: enabled,
      // Reset backup codes count when enabling (will be set to initial count)
      // Keep existing count when disabling
      backupCodesCount: enabled ? 10 : 0
    }))
  }

  const isEnabled = twoFactorStatus.success && twoFactorStatus.isEnabled
  const backupCodesCount = twoFactorStatus.backupCodesCount || 0

  return (
    <div className="space-y-6">
      {/* 2FA Requirement Alert */}
      {twoFactorRequirement.required && !twoFactorRequirement.hasCompleted && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong> As an administrator, you must enable two-factor authentication 
            to continue using your account. This requirement has been set by your organization's security policy.
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Status */}
      {twoFactorRequirement.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Administrator
              </Badge>
              {twoFactorRequirement.required && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  2FA Required
                </Badge>
              )}
            </div>
            
            {twoFactorRequirement.required && (
              <p className="text-sm text-gray-600 mt-2">
                Two-factor authentication is required for all administrator accounts.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Two-Factor Authentication Setup */}
      <TwoFactorSetup
        userId={user.id}
        isEnabled={isEnabled}
        backupCodesCount={backupCodesCount}
        onStatusChange={handleTwoFactorStatusChange}
      />

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Security Tips
          </CardTitle>
          <CardDescription>
            Best practices to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Use a strong, unique password</p>
                <p className="text-xs text-gray-600">
                  Use a password manager to generate and store unique passwords
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isEnabled ? 'bg-green-500' : 'bg-amber-500'}`} />
              <div>
                <p className="font-medium text-sm">Enable two-factor authentication</p>
                <p className="text-xs text-gray-600">
                  Add an extra layer of security to protect your account
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Keep backup codes safe</p>
                <p className="text-xs text-gray-600">
                  Store your backup codes in a secure location separate from your authenticator
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Review account activity regularly</p>
                <p className="text-xs text-gray-600">
                  Check for any suspicious login attempts or unauthorized changes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}