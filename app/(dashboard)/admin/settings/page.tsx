import { getMunicipality } from '@/app/actions/municipality'
import { SystemSettingsLayout } from '@/components/admin/SystemSettingsLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Building2 } from 'lucide-react'

export default async function SettingsPage() {
  const municipality = await getMunicipality()

  // If no municipality exists, show setup form
  if (!municipality) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Municipality Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Set up your municipality information to get started
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Municipality Not Found
                </CardTitle>
                <CardDescription>
                  No municipality data found. Please contact your system administrator to set up your municipality.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No Municipality Setup</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your user account needs to be associated with a municipality before you can access settings.
                  </p>
                  <div className="mt-6">
                    <p className="text-xs text-gray-500">
                      <strong>System administrators:</strong> Create a municipality record in the database and associate users with it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return <SystemSettingsLayout municipality={municipality} />
}
