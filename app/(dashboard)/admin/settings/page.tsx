import { notFound } from 'next/navigation'
import { getMunicipality } from '@/app/actions/municipality'
import { EditMunicipalityForm } from '@/components/admin/EditMunicipalityForm'

export default async function SettingsPage() {
  const municipality = await getMunicipality()

  if (!municipality) {
    notFound()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Municipality Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your municipality information and contact details
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-6 shadow">
            <EditMunicipalityForm municipality={municipality} />
          </div>
        </div>
      </div>
    </div>
  )
}
