'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { verifyTwoFactorAction, useTwoFactorBackupCodeAction } from '@/app/actions/2fa-actions'
import { Shield, Smartphone, Key, AlertTriangle, ArrowLeft } from 'lucide-react'

interface TwoFactorChallengeProps {
  userId?: string
  onSuccess: () => void
  onCancel?: () => void
  title?: string
  description?: string
}

export function TwoFactorChallenge({ 
  userId, 
  onSuccess, 
  onCancel,
  title = "Two-Factor Authentication Required",
  description = "Please enter your verification code to continue."
}: TwoFactorChallengeProps) {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'totp' | 'backup'>('totp')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleTotpVerify() {
    if (!code.trim()) {
      setError('Please enter the verification code')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await verifyTwoFactorAction(code, userId)
        
        if (result.success) {
          onSuccess()
        } else {
          setError(result.error || 'Invalid verification code')
        }
      } catch (err) {
        setError('Failed to verify code. Please try again.')
      }
    })
  }

  async function handleBackupCodeVerify() {
    if (!code.trim()) {
      setError('Please enter a backup code')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await useTwoFactorBackupCodeAction(code, userId)
        
        if (result.success) {
          onSuccess()
        } else {
          setError(result.error || 'Invalid backup code')
        }
      } catch (err) {
        setError('Failed to verify backup code. Please try again.')
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (mode === 'totp') {
      handleTotpVerify()
    } else {
      handleBackupCodeVerify()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'totp' ? (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Smartphone className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Open your authenticator app and enter the 6-digit code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending || code.length !== 6}
              >
                {isPending ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-gray-500 uppercase">Or</span>
                  <Separator className="flex-1" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMode('backup')
                    setCode('')
                    setError(null)
                  }}
                  className="w-full"
                >
                  <Key className="h-3 w-3 mr-2" />
                  Use Backup Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Key className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Enter one of your backup codes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-code">Backup Code</Label>
                <Input
                  id="backup-code"
                  type="text"
                  placeholder="ABCD-EFGH-IJKL"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center font-mono tracking-wide"
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-gray-500">
                  Format: XXXX-XXXX-XXXX
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !code.trim()}
              >
                {isPending ? 'Verifying...' : 'Use Backup Code'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setMode('totp')
                  setCode('')
                  setError(null)
                }}
                className="w-full"
              >
                <ArrowLeft className="h-3 w-3 mr-2" />
                Back to Authenticator Code
              </Button>
            </div>
          )}
        </form>

        {onCancel && (
          <>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="w-full"
              disabled={isPending}
            >
              Cancel
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}