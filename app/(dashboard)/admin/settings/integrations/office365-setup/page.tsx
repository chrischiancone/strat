import { Office365SetupGuide } from '@/components/admin/settings/integrations/Office365SetupGuide'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'

export default function Office365SetupPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Office 365 Integration Setup"
        description="Step-by-step guide to connect Office 365 with your strategic planning platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Integrations', href: '/admin/settings' },
          { label: 'Office 365 Setup', current: true }
        ]}
      />
      
      <PageContainer>
        <Office365SetupGuide />
      </PageContainer>
    </div>
  )
}
