'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Video,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Copy,
  AlertCircle,
  Info,
  Key,
  Settings,
  Calendar,
  Shield,
  Users,
  ChevronDown,
  ChevronUp,
  Wifi,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Video,
    title: 'Meeting Integration',
    description: 'Create and manage Zoom meetings directly from strategic plans',
  },
  {
    icon: Calendar,
    title: 'Scheduled Meetings',
    description: 'Sync planning sessions and review meetings with Zoom',
  },
  {
    icon: Users,
    title: 'Participant Tracking',
    description: 'Track attendance and engagement in planning meetings',
  },
  {
    icon: Bell,
    title: 'Meeting Notifications',
    description: 'Receive alerts for upcoming meetings and changes',
  },
]

const requiredScopes = [
  { scope: 'meeting:read', description: 'Read meeting information' },
  { scope: 'meeting:write', description: 'Create and manage meetings' },
  { scope: 'user:read', description: 'Read user information' },
  { scope: 'recording:read', description: 'Access meeting recordings' },
  { scope: 'webinar:read', description: 'Read webinar information' },
]

export function ZoomSetupGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(1)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const toggleStep = (stepId: number) => {
    setActiveStep(activeStep === stepId ? null : stepId)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      {/* Introduction */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Connect Zoom</CardTitle>
              <CardDescription className="mt-2 text-base">
                Enable video conferencing integration for strategic planning meetings, reviews, and team collaboration sessions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <feature.icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Before You Begin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Zoom Account Admin Access Required</p>
              <p className="mt-1 text-blue-800">You need Account Owner or Admin role in Zoom to create apps and manage integrations.</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Active Zoom Pro, Business, or Enterprise account</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Zoom account admin or owner permissions</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Approximately 10-15 minutes to complete setup</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Setup Instructions</h2>
        
        {/* Step 1 */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 1 ? "border-blue-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(1)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                  1
                </div>
                <div>
                  <CardTitle className="text-lg">Create Zoom App</CardTitle>
                  <CardDescription>Register a Server-to-Server OAuth app • 3 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 1 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 1 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Go to Zoom App Marketplace</span>
                  <div className="ml-6 mt-2">
                    <a 
                      href="https://marketplace.zoom.us/develop/create" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Open Zoom App Marketplace <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Create" and select "Server-to-Server OAuth"</span>
                  <div className="ml-6 mt-2 space-y-2">
                    <div className="bg-gray-50 p-3 rounded border space-y-2">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">App Name:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">Strategic Planning Integration</code>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard('Strategic Planning Integration', 'zoom-app-name')}
                          >
                            {copiedText === 'zoom-app-name' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">App Type: <strong>Account-level app</strong></p>
                    </div>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Fill in the required information</span>
                  <div className="ml-6 mt-2">
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• Company Name: Your municipality name</li>
                      <li>• Developer Contact: Your admin email</li>
                      <li>• Short Description: "Integration for strategic planning and meeting management"</li>
                    </ul>
                  </div>
                </li>
              </ol>
            </CardContent>
          )}
        </Card>

        {/* Step 2 */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 2 ? "border-blue-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(2)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                  2
                </div>
                <div>
                  <CardTitle className="text-lg">Configure Scopes</CardTitle>
                  <CardDescription>Add required API permissions • 2 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 2 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 2 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="space-y-3">
                <p className="text-sm text-gray-700">Navigate to the <strong>Scopes</strong> tab and add these permissions:</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-900">Scope</th>
                        <th className="text-left p-3 font-medium text-gray-900">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {requiredScopes.map((item, index) => (
                        <tr key={index}>
                          <td className="p-3">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.scope}</code>
                          </td>
                          <td className="p-3 text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-900">
                    Click <strong>"Add Scopes"</strong> and search for each permission. Select all required scopes before continuing.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 3 */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 3 ? "border-blue-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(3)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                  3
                </div>
                <div>
                  <CardTitle className="text-lg">Get Credentials</CardTitle>
                  <CardDescription>Copy Account ID, Client ID, and Client Secret • 2 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 3 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 3 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Navigate to the "App Credentials" tab</span>
                  <div className="ml-6 mt-2">
                    <p className="text-xs text-gray-600">You'll find three important values here that you'll need for the integration.</p>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Copy your credentials</span>
                  <div className="ml-6 mt-2 space-y-3">
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-xs text-gray-600 mb-1">Account ID:</p>
                      <code className="block bg-white px-3 py-2 rounded border text-xs text-gray-700">Your Zoom Account ID will appear here</code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-xs text-gray-600 mb-1">Client ID:</p>
                      <code className="block bg-white px-3 py-2 rounded border text-xs text-gray-700">Your Client ID will appear here</code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-xs text-gray-600 mb-1">Client Secret:</p>
                      <code className="block bg-white px-3 py-2 rounded border text-xs text-gray-700">Click "View" to reveal your secret</code>
                    </div>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Store credentials securely</span>
                  <div className="ml-6 mt-2">
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <Shield className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-900">
                        Keep your Client Secret secure. Never share it publicly or commit it to version control.
                      </p>
                    </div>
                  </div>
                </li>
              </ol>
            </CardContent>
          )}
        </Card>

        {/* Step 4 */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 4 ? "border-blue-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(4)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                  4
                </div>
                <div>
                  <CardTitle className="text-lg">Configure Webhooks (Optional)</CardTitle>
                  <CardDescription>Receive real-time meeting updates • 3 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 4 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 4 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-900">
                    Webhooks allow you to receive real-time notifications about meeting events like start, end, participant join/leave, and recording completion.
                  </p>
                </div>
                <ol className="space-y-3 list-decimal list-inside text-sm">
                  <li className="text-gray-900">
                    <span className="font-medium">Go to the "Feature" tab in your Zoom app</span>
                  </li>
                  <li className="text-gray-900">
                    <span className="font-medium">Enable "Event Subscriptions"</span>
                  </li>
                  <li className="text-gray-900">
                    <span className="font-medium">Add your webhook endpoint URL</span>
                    <div className="ml-6 mt-2">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-100 px-3 py-2 rounded border text-xs">https://your-domain.com/api/webhooks/zoom</code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard('https://your-domain.com/api/webhooks/zoom', 'webhook-url')}
                        >
                          {copiedText === 'webhook-url' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  <li className="text-gray-900">
                    <span className="font-medium">Subscribe to events:</span>
                    <ul className="ml-6 mt-2 space-y-1 text-xs text-gray-600">
                      <li>• Meeting started</li>
                      <li>• Meeting ended</li>
                      <li>• Participant joined</li>
                      <li>• Recording completed</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 5 */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 5 ? "border-blue-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(5)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">
                  5
                </div>
                <div>
                  <CardTitle className="text-lg">Complete Integration Setup</CardTitle>
                  <CardDescription>Add credentials and test connection • 2 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 5 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 5 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Return to Integration Settings</span>
                  <div className="ml-6 mt-2">
                    <Link href="/admin/settings/system?tab=integrations">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Go to Integration Settings
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Enable Zoom integration and enter your credentials</span>
                  <div className="ml-6 mt-2">
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• Paste your Account ID</li>
                      <li>• Paste your Client ID</li>
                      <li>• Paste your Client Secret</li>
                      <li>• (Optional) Add your Webhook Secret</li>
                    </ul>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Test the connection</span>
                  <div className="ml-6 mt-2">
                    <p className="text-xs text-gray-600">Click "Test Connection" to verify your credentials are working correctly.</p>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Save your settings</span>
                  <div className="ml-6 mt-2">
                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-900">
                        Once saved, you can start creating and managing Zoom meetings from within your strategic plans.
                      </p>
                    </div>
                  </div>
                </li>
              </ol>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Troubleshooting */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-amber-900">Connection test fails?</p>
              <ul className="mt-1 space-y-1 text-amber-800 text-xs ml-4">
                <li>• Verify all three credentials (Account ID, Client ID, Client Secret) are correct</li>
                <li>• Check that all required scopes have been added to your app</li>
                <li>• Ensure the app is activated in the Zoom App Marketplace</li>
                <li>• Confirm your Zoom account has the necessary permissions</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-amber-900">Can't create meetings?</p>
              <ul className="mt-1 space-y-1 text-amber-800 text-xs ml-4">
                <li>• Verify the <code className="bg-amber-100 px-1 rounded">meeting:write</code> scope is enabled</li>
                <li>• Check that your Zoom account license allows creating meetings</li>
                <li>• Ensure the API credentials haven't expired</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-amber-900">Webhooks not working?</p>
              <ul className="mt-1 space-y-1 text-amber-800 text-xs ml-4">
                <li>• Verify your webhook URL is publicly accessible and using HTTPS</li>
                <li>• Check that you've subscribed to the correct event types</li>
                <li>• Validate your webhook secret matches the one in Zoom settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-900">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Schedule strategic planning sessions directly from your plans</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Track meeting attendance and engagement metrics</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Access meeting recordings and transcripts within the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Receive notifications about upcoming review meetings</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
