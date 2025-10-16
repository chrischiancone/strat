import { ActiveDirectorySetupGuide } from '@/components/admin/settings/integrations/ActiveDirectorySetupGuide'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'

export default function ActiveDirectorySetupPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Active Directory Integration Setup"
        description="Step-by-step guide to connect Active Directory with your strategic planning platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Integrations', href: '/admin/settings' },
          { label: 'Active Directory Setup', current: true }
        ]}
      />
      
      <PageContainer>
        <ActiveDirectorySetupGuide />
      </PageContainer>
    </div>
  )
}
