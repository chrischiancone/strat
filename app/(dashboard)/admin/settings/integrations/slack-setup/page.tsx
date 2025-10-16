import { SlackSetupGuide } from '@/components/admin/settings/integrations/SlackSetupGuide'
import { PageHeader } from '@/components/layouts/PageHeader'
import { PageContainer } from '@/components/layouts/PageContainer'

export default function SlackSetupPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Slack Integration Setup"
        description="Step-by-step guide to connect Slack with your strategic planning platform"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Integrations', href: '/admin/settings' },
          { label: 'Slack Setup', current: true }
        ]}
      />
      
      <PageContainer>
        <SlackSetupGuide />
      </PageContainer>
    </div>
  )
}
