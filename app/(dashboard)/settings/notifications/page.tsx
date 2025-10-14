'use client'

import { useState } from 'react'
import { Bell, Mail, MessageSquare, Users, Target, TrendingUp, Calendar, AlertCircle, Settings, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

interface NotificationSetting {
  id: string
  category: string
  title: string
  description: string
  icon: any
  defaultEnabled: boolean
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

const notificationCategories = [
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Activities on plans, goals, and initiatives you\'re involved with',
    icon: Users,
    settings: [
      {
        id: 'comment-mention',
        title: 'Mentions in Comments',
        description: 'When someone mentions you in a comment',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'comment-reply',
        title: 'Comment Replies',
        description: 'When someone replies to your comment',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'new-comment',
        title: 'New Comments',
        description: 'When someone adds a comment to items you\'re watching',
        defaultEnabled: true,
        emailEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'collaboration-invite',
        title: 'Collaboration Invites',
        description: 'When you\'re invited to collaborate on a plan or goal',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      }
    ]
  },
  {
    id: 'plans',
    title: 'Strategic Plans',
    description: 'Updates about strategic plans you\'re involved with',
    icon: Target,
    settings: [
      {
        id: 'plan-status-change',
        title: 'Plan Status Changes',
        description: 'When a plan\'s status is updated',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'plan-deadline',
        title: 'Plan Deadlines',
        description: 'Reminders about upcoming plan deadlines',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'daily' as const
      },
      {
        id: 'plan-assignment',
        title: 'Plan Assignments',
        description: 'When you\'re assigned to work on a plan',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      }
    ]
  },
  {
    id: 'goals',
    title: 'Strategic Goals',
    description: 'Updates about goals and their progress',
    icon: TrendingUp,
    settings: [
      {
        id: 'goal-status-change',
        title: 'Goal Status Changes',
        description: 'When a goal\'s status is updated',
        defaultEnabled: true,
        emailEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'goal-deadline',
        title: 'Goal Deadlines',
        description: 'Reminders about upcoming goal target dates',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'daily' as const
      },
      {
        id: 'goal-progress',
        title: 'Goal Progress Updates',
        description: 'Weekly summaries of goal progress',
        defaultEnabled: false,
        emailEnabled: false,
        pushEnabled: false,
        inAppEnabled: true,
        frequency: 'weekly' as const
      }
    ]
  },
  {
    id: 'initiatives',
    title: 'Initiatives',
    description: 'Updates about budget initiatives and their status',
    icon: TrendingUp,
    settings: [
      {
        id: 'initiative-status-change',
        title: 'Initiative Status Changes',
        description: 'When an initiative\'s status is updated',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'budget-approval',
        title: 'Budget Approvals',
        description: 'When initiative budgets are approved or rejected',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'initiative-assignment',
        title: 'Initiative Assignments',
        description: 'When you\'re assigned to work on an initiative',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      }
    ]
  },
  {
    id: 'system',
    title: 'System',
    description: 'System updates and administrative notifications',
    icon: Settings,
    settings: [
      {
        id: 'system-maintenance',
        title: 'System Maintenance',
        description: 'Notifications about scheduled maintenance',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true,
        frequency: 'immediate' as const
      },
      {
        id: 'feature-updates',
        title: 'Feature Updates',
        description: 'Information about new features and improvements',
        defaultEnabled: false,
        emailEnabled: false,
        pushEnabled: false,
        inAppEnabled: true,
        frequency: 'weekly' as const
      },
      {
        id: 'security-alerts',
        title: 'Security Alerts',
        description: 'Important security notifications',
        defaultEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate' as const
      }
    ]
  }
]

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState(() => {
    // Initialize settings with default values
    const initialSettings: Record<string, NotificationSetting> = {}
    notificationCategories.forEach(category => {
      category.settings.forEach(setting => {
        initialSettings[setting.id] = {
          ...setting,
          id: setting.id,
          category: category.id,
          icon: category.icon
        }
      })
    })
    return initialSettings
  })

  const [globalSettings, setGlobalSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    },
    digest: {
      enabled: true,
      frequency: 'daily' as const,
      time: '09:00'
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  const updateSetting = (settingId: string, field: keyof NotificationSetting, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: {
        ...prev[settingId],
        [field]: value
      }
    }))
  }

  const updateGlobalSetting = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setGlobalSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setGlobalSettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock API call to save settings
      const payload = {
        settings,
        globalSettings
      }
      
      console.log('Saving notification settings:', payload)
      
      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.',
      })
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'There was a problem updating your preferences. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        </div>
        <p className="text-gray-600">
          Customize how and when you receive notifications about your strategic planning activities.
        </p>
      </div>

      {/* Global Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Global Settings
          </CardTitle>
          <CardDescription>
            Master controls for all notification types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={globalSettings.emailNotifications}
                onCheckedChange={(checked) => updateGlobalSetting('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-green-500" />
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-gray-500">Receive browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={globalSettings.pushNotifications}
                onCheckedChange={(checked) => updateGlobalSetting('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <div>
                  <Label className="text-sm font-medium">In-App Notifications</Label>
                  <p className="text-xs text-gray-500">Show notifications in the app</p>
                </div>
              </div>
              <Switch
                checked={globalSettings.inAppNotifications}
                onCheckedChange={(checked) => updateGlobalSetting('inAppNotifications', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Quiet Hours</Label>
                <p className="text-xs text-gray-500">Pause notifications during specified hours</p>
              </div>
              <Switch
                checked={globalSettings.quietHours.enabled}
                onCheckedChange={(checked) => updateGlobalSetting('quietHours.enabled', checked)}
              />
            </div>
            
            {globalSettings.quietHours.enabled && (
              <div className="flex items-center gap-4 pl-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">From</Label>
                  <Select
                    value={globalSettings.quietHours.start}
                    onValueChange={(value) => updateGlobalSetting('quietHours.start', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm">To</Label>
                  <Select
                    value={globalSettings.quietHours.end}
                    onValueChange={(value) => updateGlobalSetting('quietHours.end', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Daily Digest */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Daily Digest</Label>
                <p className="text-xs text-gray-500">Receive a summary of daily activity</p>
              </div>
              <Switch
                checked={globalSettings.digest.enabled}
                onCheckedChange={(checked) => updateGlobalSetting('digest.enabled', checked)}
              />
            </div>
            
            {globalSettings.digest.enabled && (
              <div className="flex items-center gap-4 pl-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Frequency</Label>
                  <Select
                    value={globalSettings.digest.frequency}
                    onValueChange={(value) => updateGlobalSetting('digest.frequency', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Time</Label>
                  <Select
                    value={globalSettings.digest.time}
                    onValueChange={(value) => updateGlobalSetting('digest.time', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Settings */}
      <div className="space-y-6">
        {notificationCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="w-5 h-5" />
                {category.title}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.settings.map((setting) => (
                  <div key={setting.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{setting.title}</Label>
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-6 ml-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <Switch
                            checked={settings[setting.id]?.emailEnabled ?? setting.emailEnabled}
                            onCheckedChange={(checked) => updateSetting(setting.id, 'emailEnabled', checked)}
                            disabled={!globalSettings.emailNotifications}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-400" />
                          <Switch
                            checked={settings[setting.id]?.pushEnabled ?? setting.pushEnabled}
                            onCheckedChange={(checked) => updateSetting(setting.id, 'pushEnabled', checked)}
                            disabled={!globalSettings.pushNotifications}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <Switch
                            checked={settings[setting.id]?.inAppEnabled ?? setting.inAppEnabled}
                            onCheckedChange={(checked) => updateSetting(setting.id, 'inAppEnabled', checked)}
                            disabled={!globalSettings.inAppNotifications}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {setting.frequency && (
                      <div className="pl-4 flex items-center gap-2">
                        <Label className="text-xs text-gray-500">Frequency:</Label>
                        <Select
                          value={settings[setting.id]?.frequency ?? setting.frequency}
                          onValueChange={(value) => updateSetting(setting.id, 'frequency', value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {category.settings.indexOf(setting) < category.settings.length - 1 && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}