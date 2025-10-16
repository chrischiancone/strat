'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Copy,
  AlertCircle,
  Info,
  Key,
  Settings,
  Users,
  Bell,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    id: 1,
    title: 'Create a Slack App',
    icon: Settings,
    duration: '2 minutes',
    description: 'Set up a new Slack application in your workspace',
  },
  {
    id: 2,
    title: 'Configure Bot Permissions',
    icon: Shield,
    duration: '3 minutes',
    description: 'Grant necessary permissions for notifications and messaging',
  },
  {
    id: 3,
    title: 'Get Your Credentials',
    icon: Key,
    duration: '1 minute',
    description: 'Copy your Bot Token and Signing Secret',
  },
  {
    id: 4,
    title: 'Install to Workspace',
    icon: Users,
    duration: '1 minute',
    description: 'Authorize the app in your Slack workspace',
  },
  {
    id: 5,
    title: 'Test Connection',
    icon: Zap,
    duration: '1 minute',
    description: 'Verify integration is working correctly',
  },
]

const features = [
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Get instant updates on plan approvals, initiative changes, and deadlines',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share strategic plan updates with channels and team members',
  },
  {
    icon: MessageSquare,
    title: 'Comment Sync',
    description: 'Receive notifications when team members comment on plans or initiatives',
  },
  {
    icon: CheckCircle2,
    title: 'Task Reminders',
    description: 'Automated reminders for upcoming milestones and action items',
  },
]

const requiredPermissions = [
  { scope: 'chat:write', description: 'Send messages to channels' },
  { scope: 'chat:write.public', description: 'Send messages to public channels' },
  { scope: 'channels:read', description: 'View channel information' },
  { scope: 'groups:read', description: 'View private channel information' },
  { scope: 'users:read', description: 'View user information' },
  { scope: 'users:read.email', description: 'View user email addresses' },
]

export function SlackSetupGuide() {
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
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Connect Slack to Your Strategic Planning Platform</CardTitle>
              <CardDescription className="mt-2 text-base">
                Enhance team collaboration and stay informed with real-time Slack notifications for all your strategic planning activities.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <feature.icon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
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
              <p className="font-medium">Administrator Access Required</p>
              <p className="mt-1 text-blue-800">You must be a Slack workspace administrator to create and install apps. If you're not an admin, request assistance from your workspace owner.</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Active Slack workspace</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Workspace admin or owner permissions</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Approximately 10 minutes to complete setup</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Setup Instructions</h2>
        
        {/* Step 1: Create Slack App */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 1 ? "border-purple-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(1)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  1
                </div>
                <div>
                  <CardTitle className="text-lg">Create a Slack App</CardTitle>
                  <CardDescription>Set up a new Slack application • {steps[0].duration}</CardDescription>
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
                  <span className="font-medium">Visit the Slack API website</span>
                  <div className="ml-6 mt-2">
                    <a 
                      href="https://api.slack.com/apps" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Go to api.slack.com/apps <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Create New App"</span>
                  <div className="ml-6 mt-2 space-y-2">
                    <p className="text-gray-600">Choose "From scratch" when prompted</p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-xs text-gray-600 mb-2">App Name (suggestion):</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">Strategic Planning Bot</code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard('Strategic Planning Bot', 'app-name')}
                        >
                          {copiedText === 'app-name' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Select your Slack workspace</span>
                  <p className="ml-6 mt-1 text-gray-600 text-xs">Choose the workspace where you want to install the app</p>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Create App"</span>
                </li>
              </ol>
            </CardContent>
          )}
        </Card>

        {/* Step 2: Configure Permissions */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 2 ? "border-purple-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(2)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  2
                </div>
                <div>
                  <CardTitle className="text-lg">Configure Bot Permissions</CardTitle>
                  <CardDescription>Grant necessary permissions for notifications • {steps[1].duration}</CardDescription>
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
                  <span className="font-medium">In your app's dashboard, navigate to "OAuth & Permissions"</span>
                  <p className="ml-6 mt-1 text-gray-600 text-xs">Find this in the left sidebar under "Features"</p>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Scroll down to "Bot Token Scopes"</span>
                  <div className="ml-6 mt-2">
                    <p className="text-xs text-gray-600 mb-2">Add the following scopes by clicking "Add an OAuth Scope":</p>
                    <div className="bg-gray-50 p-4 rounded border space-y-2">
                      {requiredPermissions.map((perm, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2 rounded">
                          <div className="flex-1">
                            <code className="text-xs font-mono text-purple-600">{perm.scope}</code>
                            <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Save your changes</span>
                </li>
              </ol>
            </CardContent>
          )}
        </Card>

        {/* Step 3: Get Credentials */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 3 ? "border-purple-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(3)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  3
                </div>
                <div>
                  <CardTitle className="text-lg">Get Your Credentials</CardTitle>
                  <CardDescription>Copy your Bot Token and Signing Secret • {steps[2].duration}</CardDescription>
                </div>
              </div>
              {activeStep === 3 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 3 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900">Keep Your Credentials Secure</p>
                      <p className="text-amber-800 mt-1">Never share your Bot Token or Signing Secret publicly. Treat them like passwords.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Bot Token (OAuth Token)</h4>
                    <ol className="space-y-2 list-decimal list-inside text-sm text-gray-900">
                      <li>Navigate to "OAuth & Permissions" in the left sidebar</li>
                      <li>Look for "Bot User OAuth Token" (starts with <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">xoxb-</code>)</li>
                      <li>Click "Copy" to copy the token</li>
                      <li>Paste it into the "Bot Token" field in Integration Settings</li>
                    </ol>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Signing Secret</h4>
                    <ol className="space-y-2 list-decimal list-inside text-sm text-gray-900">
                      <li>Navigate to "Basic Information" in the left sidebar</li>
                      <li>Scroll to "App Credentials" section</li>
                      <li>Find "Signing Secret" and click "Show"</li>
                      <li>Copy the secret</li>
                      <li>Paste it into the "Signing Secret" field in Integration Settings</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 4: Install to Workspace */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 4 ? "border-purple-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(4)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  4
                </div>
                <div>
                  <CardTitle className="text-lg">Install to Workspace</CardTitle>
                  <CardDescription>Authorize the app in your Slack workspace • {steps[3].duration}</CardDescription>
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
                  <span className="font-medium">Go to "OAuth & Permissions"</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Install to Workspace" button at the top</span>
                  <div className="ml-6 mt-2">
                    <p className="text-xs text-gray-600">You'll be redirected to an authorization page</p>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Review the permissions</span>
                  <p className="ml-6 mt-1 text-gray-600 text-xs">Make sure all requested permissions match what we configured</p>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Allow" to authorize</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">You'll be redirected back to your app settings</span>
                  <div className="ml-6 mt-2 bg-green-50 border border-green-200 p-3 rounded">
                    <p className="text-xs text-green-800">✓ Your Bot User OAuth Token will now be available to copy</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          )}
        </Card>

        {/* Step 5: Test Connection */}
        <Card className={cn(
          "border-2 transition-all",
          activeStep === 5 ? "border-purple-300 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(5)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  5
                </div>
                <div>
                  <CardTitle className="text-lg">Test Connection</CardTitle>
                  <CardDescription>Verify integration is working • {steps[4].duration}</CardDescription>
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
                  <span className="font-medium">Enter your Workspace URL</span>
                  <div className="ml-6 mt-2">
                    <p className="text-xs text-gray-600 mb-2">Format: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">https://yourworkspace.slack.com</code></p>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Paste your Bot Token and Signing Secret</span>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Test Connection"</span>
                  <div className="ml-6 mt-2">
                    <p className="text-xs text-gray-600">This will send a test message to verify the connection</p>
                  </div>
                </li>
                <li className="text-sm text-gray-900">
                  <span className="font-medium">Click "Save Integration Settings"</span>
                  <div className="ml-6 mt-2 bg-green-50 border border-green-200 p-3 rounded">
                    <p className="text-sm font-medium text-green-900">🎉 You're all set!</p>
                    <p className="text-xs text-green-800 mt-1">Your team will now receive real-time notifications in Slack for strategic planning updates.</p>
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
              <h4 className="font-semibold text-sm text-gray-900">Connection Test Fails</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Verify your Bot Token starts with <code className="bg-gray-100 px-1 py-0.5 rounded">xoxb-</code></li>
                <li>Ensure you've installed the app to your workspace</li>
                <li>Check that all required permissions are granted</li>
                <li>Confirm the Signing Secret is correct</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm text-gray-900">Can't Find OAuth Token</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Make sure you've clicked "Install to Workspace" first</li>
                <li>Token only appears after workspace installation</li>
                <li>Look under "OAuth & Permissions" → "Bot User OAuth Token"</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm text-gray-900">Missing Permissions</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Reinstall the app to your workspace after adding scopes</li>
                <li>Confirm all required scopes are listed in Bot Token Scopes</li>
                <li>Check workspace admin hasn't restricted app installations</li>
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
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Once your Slack integration is connected, you'll receive notifications for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Strategic plan approvals and status changes</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Initiative updates and milestone completions</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Comments and mentions in plan discussions</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Deadline reminders and upcoming tasks</span>
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
              <a href="https://api.slack.com/docs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Slack API Docs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
