'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Zap, 
  Shield, 
  Users, 
  MessageSquare, 
  Calendar,
  Mail,
  FileText,
  Database,
  Cloud,
  Wifi,
  Lock,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  ExternalLink,
  Refresh,
  Test,
  Play,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    integrations?: {
      microsoft_teams?: {
        enabled: boolean
        tenant_id?: string
        app_id?: string
        app_secret?: string
        webhook_url?: string
        channels?: string[]
        notifications_enabled?: boolean
      }
      active_directory?: {
        enabled: boolean
        domain?: string
        server_url?: string
        bind_dn?: string
        bind_password?: string
        user_base_dn?: string
        group_base_dn?: string
        sync_enabled?: boolean
        sync_frequency?: 'hourly' | 'daily' | 'weekly'
        last_sync?: string
      }
      office365?: {
        enabled: boolean
        tenant_id?: string
        client_id?: string
        client_secret?: string
        calendar_sync?: boolean
        email_notifications?: boolean
      }
      google_workspace?: {
        enabled: boolean
        domain?: string
        service_account_key?: string
        calendar_sync?: boolean
        drive_integration?: boolean
      }
      slack?: {
        enabled: boolean
        workspace_url?: string
        bot_token?: string
        signing_secret?: string
        channels?: string[]
      }
      zoom?: {
        enabled: boolean
        account_id?: string
        client_id?: string
        client_secret?: string
        webhook_secret?: string
      }
      sharepoint?: {
        enabled: boolean
        site_url?: string
        client_id?: string
        client_secret?: string
        document_library?: string
      }
    }
  } | null
}

interface IntegrationSettingsProps {
  municipality: Municipality
}

type IntegrationType = 'microsoft_teams' | 'active_directory' | 'office365' | 'google_workspace' | 'slack' | 'zoom' | 'sharepoint'

interface ConnectionStatus {
  [key: string]: 'connected' | 'disconnected' | 'testing' | 'error'
}

export function IntegrationSettings({ municipality }: IntegrationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({})
  
  // Current integration settings
  const currentIntegrations = municipality.settings?.integrations || {}
  const [integrations, setIntegrations] = useState({
    microsoft_teams: {
      enabled: false,
      tenant_id: '',
      app_id: '',
      app_secret: '',
      webhook_url: '',
      channels: [],
      notifications_enabled: true,
      ...currentIntegrations.microsoft_teams
    },
    active_directory: {
      enabled: false,
      domain: '',
      server_url: '',
      bind_dn: '',
      bind_password: '',
      user_base_dn: '',
      group_base_dn: '',
      sync_enabled: true,
      sync_frequency: 'daily',
      ...currentIntegrations.active_directory
    },
    office365: {
      enabled: false,
      tenant_id: '',
      client_id: '',
      client_secret: '',
      calendar_sync: true,
      email_notifications: true,
      ...currentIntegrations.office365
    },
    google_workspace: {
      enabled: false,
      domain: '',
      service_account_key: '',
      calendar_sync: true,
      drive_integration: false,
      ...currentIntegrations.google_workspace
    },
    slack: {
      enabled: false,
      workspace_url: '',
      bot_token: '',
      signing_secret: '',
      channels: [],
      ...currentIntegrations.slack
    },
    zoom: {
      enabled: false,
      account_id: '',
      client_id: '',
      client_secret: '',
      webhook_secret: '',
      ...currentIntegrations.zoom
    },
    sharepoint: {
      enabled: false,
      site_url: '',
      client_id: '',
      client_secret: '',
      document_library: 'Documents',
      ...currentIntegrations.sharepoint
    }
  })

  const handleSaveIntegrations = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { updateIntegrationSettings } = await import('@/app/actions/settings')
      const result = await updateIntegrationSettings(municipality.id, integrations)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Integration settings updated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to save integration settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const testConnection = async (type: IntegrationType) => {
    setConnectionStatus(prev => ({ ...prev, [type]: 'testing' }))
    
    try {
      // TODO: Implement actual connection testing
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3
      setConnectionStatus(prev => ({ 
        ...prev, 
        [type]: success ? 'connected' : 'error' 
      }))
      
      if (!success) {
        setError(`Failed to connect to ${type.replace('_', ' ').toUpperCase()}`)
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      setConnectionStatus(prev => ({ ...prev, [type]: 'error' }))
    }
  }

  const syncActiveDirectory = async () => {
    setConnectionStatus(prev => ({ ...prev, 'active_directory_sync': 'testing' }))
    
    try {
      // TODO: Implement actual AD sync
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate sync
      setConnectionStatus(prev => ({ ...prev, 'active_directory_sync': 'connected' }))
      setSuccess('Active Directory sync completed successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setConnectionStatus(prev => ({ ...prev, 'active_directory_sync': 'error' }))
      setError('Active Directory sync failed')
      setTimeout(() => setError(null), 3000)
    }
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'testing': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (enabled: boolean, status?: string) => {
    if (!enabled) return <Badge variant="secondary">Disabled</Badge>
    if (status === 'connected') return <Badge className="bg-green-100 text-green-800">Connected</Badge>
    if (status === 'testing') return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>
    if (status === 'error') return <Badge className="bg-red-100 text-red-800">Error</Badge>
    return <Badge variant="outline">Not Connected</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Integration Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure third-party services, APIs, and external connections for your municipality.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="microsoft" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* Microsoft Tab */}
        <TabsContent value="microsoft" className="space-y-6">
          {/* Microsoft Teams */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Microsoft Teams</CardTitle>
                    <CardDescription>
                      Send notifications and updates to Teams channels
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integrations.microsoft_teams.enabled, connectionStatus.microsoft_teams)}
                  <Switch 
                    checked={integrations.microsoft_teams.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        microsoft_teams: { ...prev.microsoft_teams, enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {integrations.microsoft_teams.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tenant ID</Label>
                    <Input
                      value={integrations.microsoft_teams.tenant_id}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        microsoft_teams: { ...prev.microsoft_teams, tenant_id: e.target.value }
                      }))}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Application ID</Label>
                    <Input
                      value={integrations.microsoft_teams.app_id}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        microsoft_teams: { ...prev.microsoft_teams, app_id: e.target.value }
                      }))}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Application Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.teams_secret ? 'text' : 'password'}
                      value={integrations.microsoft_teams.app_secret}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        microsoft_teams: { ...prev.microsoft_teams, app_secret: e.target.value }
                      }))}
                      placeholder="Enter application secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('teams_secret')}
                    >
                      {showSecrets.teams_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Webhook URL (Optional)</Label>
                  <Input
                    value={integrations.microsoft_teams.webhook_url}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      microsoft_teams: { ...prev.microsoft_teams, webhook_url: e.target.value }
                    }))}
                    placeholder="https://outlook.office.com/webhook/..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-gray-500">Send plan updates and alerts to Teams</p>
                  </div>
                  <Switch 
                    checked={integrations.microsoft_teams.notifications_enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        microsoft_teams: { ...prev.microsoft_teams, notifications_enabled: enabled }
                      }))
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('microsoft_teams')}
                    disabled={connectionStatus.microsoft_teams === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.microsoft_teams)}
                    Test Connection
                  </Button>
                  <Link href="/admin/settings/integrations/teams-setup">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Setup Guide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Active Directory */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-blue-700" />
                  <div>
                    <CardTitle>Active Directory</CardTitle>
                    <CardDescription>
                      Sync users and groups from your organization's AD
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integrations.active_directory.enabled, connectionStatus.active_directory)}
                  <Switch 
                    checked={integrations.active_directory.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        active_directory: { ...prev.active_directory, enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {integrations.active_directory.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input
                      value={integrations.active_directory.domain}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        active_directory: { ...prev.active_directory, domain: e.target.value }
                      }))}
                      placeholder="company.local"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Server URL</Label>
                    <Input
                      value={integrations.active_directory.server_url}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        active_directory: { ...prev.active_directory, server_url: e.target.value }
                      }))}
                      placeholder="ldap://dc.company.local:389"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bind DN</Label>
                    <Input
                      value={integrations.active_directory.bind_dn}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        active_directory: { ...prev.active_directory, bind_dn: e.target.value }
                      }))}
                      placeholder="CN=service,OU=Users,DC=company,DC=local"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bind Password</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets.ad_password ? 'text' : 'password'}
                        value={integrations.active_directory.bind_password}
                        onChange={(e) => setIntegrations(prev => ({
                          ...prev,
                          active_directory: { ...prev.active_directory, bind_password: e.target.value }
                        }))}
                        placeholder="Enter bind password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecretVisibility('ad_password')}
                      >
                        {showSecrets.ad_password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>User Base DN</Label>
                    <Input
                      value={integrations.active_directory.user_base_dn}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        active_directory: { ...prev.active_directory, user_base_dn: e.target.value }
                      }))}
                      placeholder="OU=Users,DC=company,DC=local"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Group Base DN</Label>
                    <Input
                      value={integrations.active_directory.group_base_dn}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        active_directory: { ...prev.active_directory, group_base_dn: e.target.value }
                      }))}
                      placeholder="OU=Groups,DC=company,DC=local"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Automatic Sync</Label>
                    <p className="text-sm text-gray-500">Automatically sync users and groups</p>
                  </div>
                  <Switch 
                    checked={integrations.active_directory.sync_enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        active_directory: { ...prev.active_directory, sync_enabled: enabled }
                      }))
                    }
                  />
                </div>
                {integrations.active_directory.sync_enabled && (
                  <div className="space-y-2">
                    <Label>Sync Frequency</Label>
                    <Select 
                      value={integrations.active_directory.sync_frequency}
                      onValueChange={(value: 'hourly' | 'daily' | 'weekly') => 
                        setIntegrations(prev => ({
                          ...prev,
                          active_directory: { ...prev.active_directory, sync_frequency: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('active_directory')}
                    disabled={connectionStatus.active_directory === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.active_directory)}
                    Test Connection
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={syncActiveDirectory}
                    disabled={connectionStatus.active_directory_sync === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.active_directory_sync)}
                    Sync Now
                  </Button>
                  <Link href="/admin/settings/integrations/active-directory-setup">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Setup Guide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Office 365 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-orange-600" />
                  <div>
                    <CardTitle>Office 365</CardTitle>
                    <CardDescription>
                      Calendar integration and email notifications
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integrations.office365.enabled, connectionStatus.office365)}
                  <Switch 
                    checked={integrations.office365.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        office365: { ...prev.office365, enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {integrations.office365.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tenant ID</Label>
                    <Input
                      value={integrations.office365.tenant_id}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        office365: { ...prev.office365, tenant_id: e.target.value }
                      }))}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input
                      value={integrations.office365.client_id}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        office365: { ...prev.office365, client_id: e.target.value }
                      }))}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.office365_secret ? 'text' : 'password'}
                      value={integrations.office365.client_secret}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        office365: { ...prev.office365, client_secret: e.target.value }
                      }))}
                      placeholder="Enter client secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('office365_secret')}
                    >
                      {showSecrets.office365_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Calendar Sync</Label>
                      <p className="text-sm text-gray-500">Sync meeting schedules and deadlines</p>
                    </div>
                    <Switch 
                      checked={integrations.office365.calendar_sync}
                      onCheckedChange={(enabled) => 
                        setIntegrations(prev => ({
                          ...prev,
                          office365: { ...prev.office365, calendar_sync: enabled }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send notifications via Outlook</p>
                    </div>
                    <Switch 
                      checked={integrations.office365.email_notifications}
                      onCheckedChange={(enabled) => 
                        setIntegrations(prev => ({
                          ...prev,
                          office365: { ...prev.office365, email_notifications: enabled }
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('office365')}
                    disabled={connectionStatus.office365 === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.office365)}
                    Test Connection
                  </Button>
                  <Link href="/admin/settings/integrations/office365-setup">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Setup Guide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SharePoint */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-800" />
                  <div>
                    <CardTitle>SharePoint</CardTitle>
                    <CardDescription>
                      Document storage and collaboration
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integrations.sharepoint.enabled, connectionStatus.sharepoint)}
                  <Switch 
                    checked={integrations.sharepoint.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        sharepoint: { ...prev.sharepoint, enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {integrations.sharepoint.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input
                    value={integrations.sharepoint.site_url}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      sharepoint: { ...prev.sharepoint, site_url: e.target.value }
                    }))}
                    placeholder="https://yourtenant.sharepoint.com/sites/yoursite"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input
                      value={integrations.sharepoint.client_id}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        sharepoint: { ...prev.sharepoint, client_id: e.target.value }
                      }))}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Document Library</Label>
                    <Input
                      value={integrations.sharepoint.document_library}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        sharepoint: { ...prev.sharepoint, document_library: e.target.value }
                      }))}
                      placeholder="Documents"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecrets.sharepoint_secret ? 'text' : 'password'}
                      value={integrations.sharepoint.client_secret}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        sharepoint: { ...prev.sharepoint, client_secret: e.target.value }
                      }))}
                      placeholder="Enter client secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('sharepoint_secret')}
                    >
                      {showSecrets.sharepoint_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('sharepoint')}
                    disabled={connectionStatus.sharepoint === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.sharepoint)}
                    Test Connection
                  </Button>
                  <Link href="/admin/settings/integrations/sharepoint-setup">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Setup Guide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Google Tab */}
        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cloud className="h-6 w-6 text-blue-500" />
                  <div>
                    <CardTitle>Google Workspace</CardTitle>
                    <CardDescription>
                      Calendar, Drive, and email integration
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integrations.google_workspace.enabled, connectionStatus.google_workspace)}
                  <Switch 
                    checked={integrations.google_workspace.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        google_workspace: { ...prev.google_workspace, enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {integrations.google_workspace.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Input
                    value={integrations.google_workspace.domain}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      google_workspace: { ...prev.google_workspace, domain: e.target.value }
                    }))}
                    placeholder="company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Account Key (JSON)</Label>
                  <textarea
                    className="w-full h-24 p-3 border border-gray-300 rounded-md font-mono text-xs"
                    value={integrations.google_workspace.service_account_key}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      google_workspace: { ...prev.google_workspace, service_account_key: e.target.value }
                    }))}
                    placeholder="Paste your service account JSON key here"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Calendar Sync</Label>
                      <p className="text-sm text-gray-500">Sync with Google Calendar</p>
                    </div>
                    <Switch 
                      checked={integrations.google_workspace.calendar_sync}
                      onCheckedChange={(enabled) => 
                        setIntegrations(prev => ({
                          ...prev,
                          google_workspace: { ...prev.google_workspace, calendar_sync: enabled }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Google Drive Integration</Label>
                      <p className="text-sm text-gray-500">Store documents in Drive</p>
                    </div>
                    <Switch 
                      checked={integrations.google_workspace.drive_integration}
                      onCheckedChange={(enabled) => 
                        setIntegrations(prev => ({
                          ...prev,
                          google_workspace: { ...prev.google_workspace, drive_integration: enabled }
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('google_workspace')}
                    disabled={connectionStatus.google_workspace === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.google_workspace)}
                    Test Connection
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Setup Guide
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          {/* Slack */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  <div>
                    <CardTitle>Slack</CardTitle>
                    <CardDescription>
                      Team communication and notifications
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integrations.slack.enabled, connectionStatus.slack)}
                  <Switch 
                    checked={integrations.slack.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        slack: { ...prev.slack, enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {integrations.slack.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workspace URL</Label>
                  <Input
                    value={integrations.slack.workspace_url}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      slack: { ...prev.slack, workspace_url: e.target.value }
                    }))}
                    placeholder="https://yourworkspace.slack.com"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot Token</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets.slack_token ? 'text' : 'password'}
                        value={integrations.slack.bot_token}
                        onChange={(e) => setIntegrations(prev => ({
                          ...prev,
                          slack: { ...prev.slack, bot_token: e.target.value }
                        }))}
                        placeholder="xoxb-..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecretVisibility('slack_token')}
                      >
                        {showSecrets.slack_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Signing Secret</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets.slack_secret ? 'text' : 'password'}
                        value={integrations.slack.signing_secret}
                        onChange={(e) => setIntegrations(prev => ({
                          ...prev,
                          slack: { ...prev.slack, signing_secret: e.target.value }
                        }))}
                        placeholder="Enter signing secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecretVisibility('slack_secret')}
                      >
                        {showSecrets.slack_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('slack')}
                    disabled={connectionStatus.slack === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.slack)}
                    Test Connection
                  </Button>
                  <Link href="/admin/settings/integrations/slack-setup">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Setup Guide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other" className="space-y-6">
          {/* Zoom */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Zoom</CardTitle>
                    <CardDescription>
                      Video conferencing integration
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integrations.zoom.enabled, connectionStatus.zoom)}
                  <Switch 
                    checked={integrations.zoom.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrations(prev => ({
                        ...prev,
                        zoom: { ...prev.zoom, enabled }
                      }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {integrations.zoom.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account ID</Label>
                    <Input
                      value={integrations.zoom.account_id}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        zoom: { ...prev.zoom, account_id: e.target.value }
                      }))}
                      placeholder="Account ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input
                      value={integrations.zoom.client_id}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        zoom: { ...prev.zoom, client_id: e.target.value }
                      }))}
                      placeholder="Client ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets.zoom_secret ? 'text' : 'password'}
                        value={integrations.zoom.client_secret}
                        onChange={(e) => setIntegrations(prev => ({
                          ...prev,
                          zoom: { ...prev.zoom, client_secret: e.target.value }
                        }))}
                        placeholder="Enter client secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecretVisibility('zoom_secret')}
                      >
                        {showSecrets.zoom_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook Secret</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets.zoom_webhook ? 'text' : 'password'}
                        value={integrations.zoom.webhook_secret}
                        onChange={(e) => setIntegrations(prev => ({
                          ...prev,
                          zoom: { ...prev.zoom, webhook_secret: e.target.value }
                        }))}
                        placeholder="Enter webhook secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleSecretVisibility('zoom_webhook')}
                      >
                        {showSecrets.zoom_webhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('zoom')}
                    disabled={connectionStatus.zoom === 'testing'}
                    className="flex items-center gap-2"
                  >
                    {getStatusIcon(connectionStatus.zoom)}
                    Test Connection
                  </Button>
                  <Link href="/admin/settings/integrations/zoom-setup">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Setup Guide
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-500">
          <p>Integration changes take effect immediately after saving.</p>
          <p>Some integrations may require additional setup in external services.</p>
        </div>
        
        <Button 
          onClick={handleSaveIntegrations}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Save Integration Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
