'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Palette, 
  Clock,
  Globe,
  FileText,
  Users,
  BarChart3,
  Zap,
  Key,
  Server,
  HardDrive,
  Wifi,
  Lock
} from 'lucide-react'

// Import all the settings section components
import { GeneralSettings } from './settings/GeneralSettings'
import { SecuritySettings } from './settings/SecuritySettings'
import { NotificationSettings } from './settings/NotificationSettings'
import { AppearanceSettings } from './settings/AppearanceSettings'
import { IntegrationSettings } from './settings/IntegrationSettings'
import { SystemMaintenanceSettings } from './settings/SystemMaintenanceSettings'
import { PerformanceSettings } from './settings/PerformanceSettings'
import { BackupSettings } from './settings/BackupSettings'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    contact_name?: string
    contact_email?: string
    contact_phone?: string
    website_url?: string
    timezone?: string
    fiscal_year_start_month?: number
    currency?: string
    features?: {
      ai_assistance?: boolean
      public_dashboard?: boolean
      multi_department_collaboration?: boolean
    }
  } | null
}

interface SystemSettingsLayoutProps {
  municipality: Municipality
}

export function SystemSettingsLayout({ municipality }: SystemSettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState('general')

  const settingsSections = [
    {
      id: 'general',
      label: 'General',
      icon: Building2,
      description: 'Municipality information and basic settings',
      color: 'text-blue-600',
    },
    {
      id: 'security', 
      label: 'Security',
      icon: Shield,
      description: 'Authentication, permissions, and security policies',
      color: 'text-red-600',
    },
    {
      id: 'notifications',
      label: 'Notifications', 
      icon: Bell,
      description: 'Email notifications, alerts, and communication settings',
      color: 'text-amber-600',
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      description: 'Branding, themes, and user interface customization',
      color: 'text-purple-600',
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Zap,
      description: 'Third-party services, APIs, and external connections',
      color: 'text-green-600',
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      description: 'System optimization, caching, and performance monitoring',
      color: 'text-indigo-600',
    },
    {
      id: 'backup',
      label: 'Backup & Recovery',
      icon: HardDrive,
      description: 'Data backup, recovery procedures, and disaster planning',
      color: 'text-emerald-600',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Server,
      description: 'System maintenance, updates, and scheduled tasks',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">{municipality.name} • Administrative Configuration</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-2xl">
              Comprehensive system administration and configuration for your strategic planning platform. 
              Manage security, integrations, appearance, and operational settings.
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Admin Only
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1">
          {/* Sidebar Navigation */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent space-y-1">
                {settingsSections.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="w-full justify-start h-auto p-4 bg-white border border-gray-200 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-start gap-3 text-left w-full">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${section.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{section.label}</div>
                          <div className="text-xs text-gray-500 line-clamp-2">{section.description}</div>
                        </div>
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <TabsContent value="general" className="mt-0 space-y-6">
                <GeneralSettings municipality={municipality} />
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-6">
                <SecuritySettings municipality={municipality} />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-6">
                <NotificationSettings municipality={municipality} />
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-6">
                <AppearanceSettings municipality={municipality} />
              </TabsContent>

              <TabsContent value="integrations" className="mt-0 space-y-6">
                <IntegrationSettings municipality={municipality} />
              </TabsContent>

              <TabsContent value="performance" className="mt-0 space-y-6">
                <PerformanceSettings municipality={municipality} />
              </TabsContent>

              <TabsContent value="backup" className="mt-0 space-y-6">
                <BackupSettings municipality={municipality} />
              </TabsContent>

              <TabsContent value="maintenance" className="mt-0 space-y-6">
                <SystemMaintenanceSettings municipality={municipality} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}