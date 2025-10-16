'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Users,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Copy,
  AlertCircle,
  Info,
  Key,
  Settings,
  Bell,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Cloud
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Bell,
    title: 'Channel Notifications',
    description: 'Post strategic plan updates directly to Teams channels',
  },
  {
    icon: MessageSquare,
    title: 'Team Collaboration',
    description: 'Enable team discussions and feedback on initiatives',
  },
  {
    icon: CheckCircle2,
    title: 'Approval Workflows',
    description: 'Request and track approvals within Teams',
  },
  {
    icon: Users,
    title: 'Mentions & Alerts',
    description: 'Tag team members for important updates and deadlines',
  },
]

const requiredPermissions = [
  { permission: 'ChannelMessage.Send', description: 'Post messages to channels' },
  { permission: 'Chat.ReadWrite', description: 'Send and receive chat messages' },
  { permission: 'Team.ReadBasic.All', description: 'Read team information' },
  { permission: 'Channel.ReadBasic.All', description: 'Read channel information' },
  { permission: 'User.Read.All', description: 'Read user profiles' },
]

export function TeamsSetupGuide() {
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
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Connect Microsoft Teams</CardTitle>
              <CardDescription className="mt-2 text-base">
                Enable seamless collaboration with Teams notifications, channel messages, and approval workflows.
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
              <p className="font-medium">Microsoft 365 Administrator Access Required</p>
              <p className="mt-1 text-blue-800">You need Global Administrator or Application Administrator role in Azure AD to register apps and grant permissions.</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Active Microsoft 365 subscription</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Azure AD admin permissions</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Approximately 15 minutes to complete setup</span>
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
                  <CardTitle className="text-lg">Register App in Azure AD</CardTitle>
                  <CardDescription>Create an app registration • 3 minutes</CardDescription>
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
                  <span className="font-medium">Go to Azure Portal</span>
                  <div className="ml-6 mt-2">
                    <a 
                      href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Open Azure App Registrations <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "+ New registration"</span>
                  <div className="ml-6 mt-2 space-y-2">
                    <div className="bg-gray-50 p-3 rounded border space-y-2">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">App Name:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">Strategic Planning Bot</code>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard('Strategic Planning Bot', 'teams-app-name')}
                          >
                            {copiedText === 'teams-app-name' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Supported account types: <strong>Accounts in this organizational directory only</strong></p>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Register"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Copy the Application (client) ID and Directory (tenant) ID</span>
                  <p className="ml-6 mt-1 text-gray-600 text-xs">You'll need these for configuration</p>
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
                  <CardTitle className="text-lg">Configure API Permissions</CardTitle>
                  <CardDescription>Grant necessary Microsoft Graph permissions • 3 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 2 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 2 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-sm text-gray-900">
                  <span className="font-medium">In your app registration, go to "API permissions"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "+ Add a permission"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Select "Microsoft Graph" → "Application permissions"</span>
                  <div className="ml-6 mt-2">
                    <div className="bg-gray-50 p-4 rounded border space-y-2">
                      {requiredPermissions.map((perm, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2 rounded">
                          <div className="flex-1">
                            <code className="text-xs font-mono text-blue-600">{perm.permission}</code>
                            <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Add permissions"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Grant admin consent for [Your Organization]"</span>
                  <div className="ml-6 mt-2 bg-amber-50 border border-amber-200 p-3 rounded">
                    <p className="text-xs text-amber-800">⚠️ This step requires admin privileges and is critical for the integration to work</p>
                  </div>
                </li>
              </ol>
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
                  <CardTitle className="text-lg">Create Client Secret</CardTitle>
                  <CardDescription>Generate authentication credentials • 2 minutes</CardDescription>
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
                  <span className="font-medium">Go to "Certificates & secrets"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Under "Client secrets", click "+ New client secret"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Add a description and choose expiration</span>
                  <p className="ml-6 mt-1 text-gray-600 text-xs">Recommended: 24 months for production environments</p>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Add"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Copy the secret value immediately</span>
                  <div className="ml-6 mt-2 bg-red-50 border border-red-200 p-3 rounded">
                    <p className="text-sm font-medium text-red-900">🔒 Important!</p>
                    <p className="text-xs text-red-800 mt-1">The secret value is only shown once. Copy it now and store it securely.</p>
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
                  <CardTitle className="text-lg">Configure Webhook (Optional)</CardTitle>
                  <CardDescription>Set up incoming webhooks for channel notifications • 3 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 4 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 4 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Open Microsoft Teams</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Navigate to the channel where you want notifications</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "..." (More options) → "Connectors"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Find "Incoming Webhook" and click "Configure"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Name your webhook</span>
                  <div className="ml-6 mt-2">
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-xs text-gray-600 mb-2">Webhook Name (suggestion):</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">Strategic Planning Updates</code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard('Strategic Planning Updates', 'webhook-name')}
                        >
                          {copiedText === 'webhook-name' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Create" and copy the webhook URL</span>
                </li>
              </ol>
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
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                  5
                </div>
                <div>
                  <CardTitle className="text-lg">Complete Integration Setup</CardTitle>
                  <CardDescription>Enter credentials and test connection • 2 minutes</CardDescription>
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
                    <Link href="/admin/settings">
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Integration Settings
                      </Button>
                    </Link>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Enter your configuration:</span>
                  <div className="ml-6 mt-2 space-y-2 text-xs text-gray-600">
                    <p>• Tenant ID (from Step 1)</p>
                    <p>• Application ID (from Step 1)</p>
                    <p>• Client Secret (from Step 3)</p>
                    <p>• Webhook URL (from Step 4, optional)</p>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Test Connection"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Save Integration Settings"</span>
                  <div className="ml-6 mt-2 bg-green-50 border border-green-200 p-3 rounded">
                    <p className="text-sm font-medium text-green-900">🎉 Integration Complete!</p>
                    <p className="text-xs text-green-800 mt-1">Your team can now receive notifications in Microsoft Teams.</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm text-gray-900">Permission Errors</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Ensure admin consent was granted for all permissions</li>
                <li>Verify you have Global Administrator or Application Administrator role</li>
                <li>Check that API permissions match the required list</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm text-gray-900">Authentication Fails</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Verify Tenant ID and Application ID are correct</li>
                <li>Ensure Client Secret hasn't expired</li>
                <li>Check that the app registration is in the correct Azure AD tenant</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm text-gray-900">Webhook Not Working</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Confirm webhook URL was copied correctly</li>
                <li>Verify the channel hasn't been deleted or renamed</li>
                <li>Check that the webhook connector is still active in Teams</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            What You Can Do Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Post plan updates to Teams channels</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Send approval requests through Teams</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Notify teams of milestone completions</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Alert stakeholders of deadline changes</span>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/admin/settings" className="flex-1">
              <Button className="w-full" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Complete Setup in Integration Settings
              </Button>
            </Link>
            <Button variant="outline" size="lg" asChild>
              <a href="https://docs.microsoft.com/en-us/graph/api/overview" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Microsoft Graph Docs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
