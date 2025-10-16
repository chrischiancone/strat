import { TeamsSetupGuide } from '@/components/admin/settings/integrations/TeamsSetupGuide'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'

export default function TeamsSetupPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Microsoft Teams Integration Setup"
        description="Step-by-step guide to connect Microsoft Teams with your strategic planning platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Integrations', href: '/admin/settings' },
          { label: 'Teams Setup', current: true }
        ]}
      />
      
      <PageContainer>
        <TeamsSetupGuide />
      </PageContainer>
    </div>
  )
}
