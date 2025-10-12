import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PasswordChangeForm } from '@/components/settings/PasswordChangeForm'
import { AccountDangerZone } from '@/components/settings/AccountDangerZone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon, Shield, Key } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Get user profile information
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single()

  if (error || !userProfile) {
    console.error('Error fetching user profile:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account security and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your password and account security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Basic information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Account ID
                </label>
                <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded border">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Account Created
                </label>
                <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Sign In
              </label>
              <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : 'Never'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <AccountDangerZone userRole={userProfile.role} />
      </div>
    </div>
  )
}