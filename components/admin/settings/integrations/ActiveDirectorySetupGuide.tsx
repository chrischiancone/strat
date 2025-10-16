'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Info,
  Users,
  RefreshCw,
  Lock,
  ChevronDown,
  ChevronUp,
  Server,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  { icon: Users, title: 'User Sync', description: 'Automatically sync user accounts from AD' },
  { icon: Shield, title: 'Single Sign-On', description: 'Enable LDAP authentication for seamless login' },
  { icon: Database, title: 'Group Management', description: 'Sync organizational units and security groups' },
  { icon: RefreshCw, title: 'Auto Updates', description: 'Keep user data synchronized automatically' },
]

export function ActiveDirectorySetupGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(1)

  const toggleStep = (stepId: number) => {
    setActiveStep(activeStep === stepId ? null : stepId)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Connect Active Directory</CardTitle>
              <CardDescription className="mt-2 text-base">
                Sync users and groups from your organization's Active Directory for centralized authentication.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <feature.icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <p className="font-medium">Domain Administrator Access Required</p>
              <p className="mt-1 text-blue-800">You need domain admin credentials to configure LDAP binding and access user/group information.</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Active Directory domain controller accessible</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Service account with read permissions</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>LDAP/LDAPS port accessible (389/636)</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Setup Instructions</h2>
        
        <Card className={cn("border-2 transition-all", activeStep === 1 ? "border-green-300 shadow-lg" : "border-gray-200")}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(1)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">1</div>
                <div>
                  <CardTitle className="text-lg">Gather AD Information</CardTitle>
                  <CardDescription>Collect necessary domain details • 3 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 1 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 1 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="font-medium mb-2">You'll need:</p>
                  <ul className="space-y-2 text-xs">
                    <li>• <strong>Domain Name:</strong> company.local</li>
                    <li>• <strong>Server URL:</strong> ldap://dc.company.local:389 or ldaps://dc.company.local:636</li>
                    <li>• <strong>Bind DN:</strong> CN=ServiceAccount,OU=Service Accounts,DC=company,DC=local</li>
                    <li>• <strong>Bind Password:</strong> Service account password</li>
                    <li>• <strong>User Base DN:</strong> OU=Users,DC=company,DC=local</li>
                    <li>• <strong>Group Base DN:</strong> OU=Groups,DC=company,DC=local</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card className={cn("border-2 transition-all", activeStep === 2 ? "border-green-300 shadow-lg" : "border-gray-200")}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(2)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">2</div>
                <div>
                  <CardTitle className="text-lg">Create Service Account</CardTitle>
                  <CardDescription>Set up AD service account • 5 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 2 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 2 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-3 list-decimal list-inside text-sm">
                <li>Open <strong>Active Directory Users and Computers</strong></li>
                <li>Create a new user account (e.g., "LDAP Service Account")</li>
                <li>Set <strong>Password never expires</strong></li>
                <li>Add to <strong>Domain Users</strong> group (minimum required)</li>
                <li>Grant <strong>Read</strong> permissions on user and group OUs</li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-800">
                ⚠️ Use a dedicated service account with minimal permissions. Never use a personal or admin account.
              </div>
            </CardContent>
          )}
        </Card>

        <Card className={cn("border-2 transition-all", activeStep === 3 ? "border-green-300 shadow-lg" : "border-gray-200")}>
          <CardHeader className="cursor-pointer" onClick={() => toggleStep(3)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">3</div>
                <div>
                  <CardTitle className="text-lg">Configure Integration</CardTitle>
                  <CardDescription>Enter AD settings and test • 3 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 3 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 3 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-3 list-decimal list-inside text-sm">
                <li>
                  Return to Integration Settings
                  <div className="ml-6 mt-2">
                    <Link href="/admin/settings">
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Integration Settings
                      </Button>
                    </Link>
                  </div>
                </li>
                <li>Enter all AD configuration details</li>
                <li>Choose sync frequency (Hourly, Daily, or Weekly)</li>
                <li>Click <strong>Test Connection</strong> to verify</li>
                <li>Click <strong>Sync Now</strong> to perform initial sync</li>
                <li>Click <strong>Save Integration Settings</strong></li>
              </ol>
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <p className="text-sm font-medium text-green-900">✓ Setup Complete!</p>
                <p className="text-xs text-green-800 mt-1">Users and groups will sync automatically based on your schedule.</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm">Connection Fails</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Verify server URL format and port (389 for LDAP, 636 for LDAPS)</li>
                <li>Check firewall rules allow connection to domain controller</li>
                <li>Ensure DNS can resolve domain controller hostname</li>
              </ul>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm">Authentication Errors</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Verify Bind DN format is correct (use full distinguished name)</li>
                <li>Confirm service account password is accurate</li>
                <li>Check account is not disabled or locked</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
