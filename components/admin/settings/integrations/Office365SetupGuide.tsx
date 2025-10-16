'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, CheckCircle2, ArrowRight, ExternalLink, AlertCircle, Info, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Office365SetupGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(1)

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Connect Office 365</CardTitle>
              <CardDescription className="mt-2 text-base">
                Sync calendars and enable email notifications through Outlook integration.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
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
              <p className="font-medium">Microsoft 365 Administrator Access Required</p>
              <p className="mt-1 text-blue-800">This integration uses the same Azure AD app as Microsoft Teams. If you've already set up Teams, you can reuse those credentials.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Setup Instructions</h2>
        
        <Card className={cn("border-2 transition-all", activeStep === 1 ? "border-orange-300 shadow-lg" : "border-gray-200")}>
          <CardHeader className="cursor-pointer" onClick={() => setActiveStep(activeStep === 1 ? null : 1)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold">1</div>
                <div>
                  <CardTitle className="text-lg">Register App in Azure AD</CardTitle>
                  <CardDescription>Same process as Microsoft Teams • 3 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 1 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 1 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Already configured Teams?</strong> You can use the same Tenant ID, Client ID, and Client Secret from your Teams integration.
                </p>
              </div>
              <p className="text-sm">If you haven't set up Teams yet, follow these steps:</p>
              <ol className="space-y-2 list-decimal list-inside text-sm">
                <li>Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Azure Portal<ExternalLink className="inline h-3 w-3 ml-1" /></a></li>
                <li>Navigate to "App registrations" → "+ New registration"</li>
                <li>Name: "Strategic Planning - Office 365"</li>
                <li>Click "Register" and copy Tenant ID and Client ID</li>
                <li>Go to "Certificates & secrets" → Create new client secret</li>
              </ol>
            </CardContent>
          )}
        </Card>

        <Card className={cn("border-2 transition-all", activeStep === 2 ? "border-orange-300 shadow-lg" : "border-gray-200")}>
          <CardHeader className="cursor-pointer" onClick={() => setActiveStep(activeStep === 2 ? null : 2)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold">2</div>
                <div>
                  <CardTitle className="text-lg">Add Calendar & Mail Permissions</CardTitle>
                  <CardDescription>Configure Microsoft Graph API permissions • 2 minutes</CardDescription>
                </div>
              </div>
              {activeStep === 2 ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          {activeStep === 2 && (
            <CardContent className="space-y-4 pt-0">
              <Separator />
              <ol className="space-y-3 list-decimal list-inside text-sm">
                <li>In your app registration, go to "API permissions"</li>
                <li>Click "+ Add a permission" → "Microsoft Graph" → "Application permissions"</li>
                <li>Add these permissions:
                  <ul className="ml-6 mt-2 space-y-1 text-xs list-disc">
                    <li><code>Calendars.ReadWrite</code> - Manage calendar events</li>
                    <li><code>Mail.Send</code> - Send email notifications</li>
                    <li><code>User.Read.All</code> - Read user information</li>
                  </ul>
                </li>
                <li>Click "Grant admin consent for [Your Organization]"</li>
              </ol>
            </CardContent>
          )}
        </Card>

        <Card className={cn("border-2 transition-all", activeStep === 3 ? "border-orange-300 shadow-lg" : "border-gray-200")}>
          <CardHeader className="cursor-pointer" onClick={() => setActiveStep(activeStep === 3 ? null : 3)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold">3</div>
                <div>
                  <CardTitle className="text-lg">Complete Setup</CardTitle>
                  <CardDescription>Configure and test integration • 2 minutes</CardDescription>
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
                <li>Enter Tenant ID, Client ID, and Client Secret</li>
                <li>Enable Calendar Sync and/or Email Notifications</li>
                <li>Click "Test Connection"</li>
                <li>Click "Save Integration Settings"</li>
              </ol>
              <div className="bg-green-50 border border-green-200 p-3 rounded mt-4">
                <p className="text-sm font-medium text-green-900">✓ Integration Complete!</p>
                <p className="text-xs text-green-800 mt-1">Calendar events and email notifications are now enabled.</p>
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
              <h4 className="font-semibold text-sm">Calendar Sync Not Working</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Verify Calendars.ReadWrite permission is granted</li>
                <li>Ensure admin consent was provided</li>
                <li>Check that users have Office 365 licenses</li>
              </ul>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-sm">Email Notifications Fail</h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 list-disc list-inside">
                <li>Confirm Mail.Send permission is active</li>
                <li>Check that sender email address is valid</li>
                <li>Verify SMTP settings if using hybrid setup</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
