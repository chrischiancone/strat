import { ZoomSetupGuide } from '@/components/admin/settings/integrations/ZoomSetupGuide'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'

export default function ZoomSetupPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Zoom Integration Setup"
        description="Step-by-step guide to connect Zoom with your strategic planning platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Integrations', href: '/admin/settings' },
          { label: 'Zoom Setup', current: true }
        ]}
      />
      
      <PageContainer>
        <ZoomSetupGuide />
      </PageContainer>
    </div>
  )
}
