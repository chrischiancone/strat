'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  initializeTwoFactorSetupAction,
  enableTwoFactorAction,
  disableTwoFactorAction 
} from '@/app/actions/2fa-actions'
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle, Copy } from 'lucide-react'
import Image from 'next/image'

interface TwoFactorSetupProps {
  userId: string
  isEnabled: boolean
  backupCodesCount: number
  onStatusChange: (enabled: boolean) => void
}

export function TwoFactorSetup({ userId, isEnabled, backupCodesCount, onStatusChange }: TwoFactorSetupProps) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleEnableTwoFactor() {
    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      try {
        const result = await initializeTwoFactorSetupAction()
        
        if (result.success && result.secret && result.qrCodeUrl && result.backupCodes) {
          setSecret(result.secret)
          setQrCode(result.qrCodeUrl)
          setBackupCodes(result.backupCodes)
          setStep('verify')
        } else {
          setError(result.error || 'Failed to set up 2FA. Please try again.')
        }
      } catch (err) {
        setError('Failed to set up 2FA. Please try again.')
      }
    })
  }

  async function handleVerifyAndEnable() {
    if (!verifyCode.trim()) {
      setError('Please enter the verification code')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await enableTwoFactorAction(secret, verifyCode, backupCodes)
        
        if (result.success) {
          setStep('complete')
          setSuccess('Two-factor authentication has been enabled successfully!')
          onStatusChange(true)
        } else {
          setError(result.error || 'Failed to enable 2FA')
        }
      } catch (err) {
        setError('Failed to enable 2FA. Please try again.')
      }
    })
  }

  async function handleDisableTwoFactor() {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await disableTwoFactorAction()
        
        if (result.success) {
          setSuccess('Two-factor authentication has been disabled.')
          onStatusChange(false)
          // Reset state
          setStep('setup')
          setSecret('')
          setQrCode('')
          setBackupCodes([])
          setVerifyCode('')
        } else {
          setError(result.error || 'Failed to disable 2FA')
        }
      } catch (err) {
        setError('Failed to disable 2FA. Please try again.')
      }
    })
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  if (isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Two-factor authentication is enabled for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
              <span className="text-sm text-gray-600">
                {backupCodesCount} backup codes remaining
              </span>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisableTwoFactor}
              disabled={isPending}
            >
              {isPending ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> Keep your authenticator app and backup codes in a safe place. 
              You'll need them to access your account.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with 2FA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Disabled
              </Badge>
              <span className="text-sm text-gray-600">
                Two-factor authentication is not enabled
              </span>
            </div>

            <div className="rounded-lg bg-amber-50 p-4">
              <h4 className="font-medium text-amber-800 mb-2">Why enable 2FA?</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Protects your account even if your password is compromised</li>
                <li>• Required for admin users for enhanced security</li>
                <li>• Works with popular apps like Google Authenticator, Authy, etc.</li>
              </ul>
            </div>

            <Button
              onClick={handleEnableTwoFactor}
              disabled={isPending}
              className="w-full"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              {isPending ? 'Setting up...' : 'Enable Two-Factor Authentication'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="font-medium">Scan QR Code</h3>
              <p className="text-sm text-gray-600">
                Scan this QR code with your authenticator app:
              </p>
              
              {qrCode && (
                <div className="flex justify-center">
                  <Image 
                    src={qrCode} 
                    alt="2FA QR Code" 
                    width={200} 
                    height={200}
                    className="border rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Or enter this secret key manually:</p>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-sm">
                  <span className="flex-1">{secret}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(secret)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter verification code</Label>
              <Input
                id="verify-code"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
              <p className="text-sm text-gray-500">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('setup')}
                disabled={isPending}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyAndEnable}
                disabled={isPending || !verifyCode.trim()}
                className="flex-1"
              >
                {isPending ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="font-medium text-green-800">2FA Enabled Successfully!</h3>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Backup Codes
              </h4>
              <p className="text-sm text-gray-600">
                Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
              
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center py-1">
                    {code}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="w-full"
              >
                <Copy className="h-3 w-3 mr-2" />
                Copy All Backup Codes
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> These backup codes will only be shown once. 
                Make sure to save them before closing this window.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => {
                setStep('setup')
                setSuccess(null)
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}