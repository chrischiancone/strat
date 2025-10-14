import { Suspense } from 'react'
import { getCurrentUser } from '@/app/actions/auth-actions'
import { getTwoFactorStatusAction, checkTwoFactorRequiredAction } from '@/app/actions/2fa-actions'
import { ProfileSecurityContent } from '@/components/profile/ProfileSecurityContent'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle } from 'lucide-react'
import { redirect } from 'next/navigation'

async function ProfileSecurityData({ searchParams }: { searchParams: { required?: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const [twoFactorStatus, twoFactorRequirement] = await Promise.all([
    getTwoFactorStatusAction(),
    checkTwoFactorRequiredAction()
  ])

  return (
    <>
      {/* Show alert if 2FA setup is required */}
      {searchParams.required && twoFactorRequirement.required && !twoFactorRequirement.hasCompleted && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {searchParams.required === 'admin' ? (
              <><strong>Admin Access Blocked:</strong> You must enable two-factor authentication to access admin features. This is required by your organization's security policy.</>
            ) : (
              <><strong>Action Required:</strong> Please set up two-factor authentication to continue using your account.</>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <ProfileSecurityContent 
        user={user}
        twoFactorStatus={twoFactorStatus}
        twoFactorRequirement={twoFactorRequirement}
      />
    </>
  )
}

function ProfileSecuritySkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfileSecurityPage({ 
  searchParams 
}: { 
  searchParams: { required?: string } 
}) {
  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-gray-600">
          Manage your account security and authentication preferences.
        </p>
      </div>

      <Suspense fallback={<ProfileSecuritySkeleton />}>
        <ProfileSecurityData searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Security Settings - Profile',
  description: 'Manage your account security settings and two-factor authentication.',
}