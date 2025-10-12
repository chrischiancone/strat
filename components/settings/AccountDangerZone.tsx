'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface AccountDangerZoneProps {
  userRole: string
}

export function AccountDangerZone({ userRole }: AccountDangerZoneProps) {
  // Only show danger zone for non-admin users (admins shouldn't delete their own accounts)
  if (userRole === 'admin') {
    return null
  }

  const handleRequestAccountDeletion = () => {
    // For now, just show an alert. In a real app, you'd want to:
    // 1. Show a confirmation dialog
    // 2. Send an email to admins requesting account deletion
    // 3. Or implement a proper account deletion flow
    alert('Account deletion requests must be handled by your system administrator. Please contact them directly.')
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">
            Request Account Deletion
          </h4>
          <p className="text-sm text-red-700 mb-4">
            Once you request account deletion, an administrator will review your request. 
            This action cannot be undone and you will lose access to all your data.
          </p>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleRequestAccountDeletion}
          >
            Request Account Deletion
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}