import { SharePointSetupGuide } from '@/components/admin/settings/integrations/SharePointSetupGuide'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'

export default function SharePointSetupPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="SharePoint Integration Setup"
        description="Step-by-step guide to connect SharePoint with your strategic planning platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Integrations', href: '/admin/settings' },
          { label: 'SharePoint Setup', current: true }
        ]}
      />
      
      <PageContainer>
        <SharePointSetupGuide />
      </PageContainer>
    </div>
  )
}
