'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { changePassword } from '@/app/actions/auth'
import { Eye, EyeOff, Key } from 'lucide-react'

export function PasswordChangeForm() {
  const { toast } = useToast()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChanging(true)

    try {
      // Validation
      if (!currentPassword.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Current password is required',
          variant: 'destructive',
        })
        return
      }

      if (!newPassword.trim()) {
        toast({
          title: 'Validation Error',
          description: 'New password is required',
          variant: 'destructive',
        })
        return
      }

      if (newPassword.length < 6) {
        toast({
          title: 'Validation Error',
          description: 'New password must be at least 6 characters long',
          variant: 'destructive',
        })
        return
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: 'Validation Error',
          description: 'New password and confirmation do not match',
          variant: 'destructive',
        })
        return
      }

      if (currentPassword === newPassword) {
        toast({
          title: 'Validation Error',
          description: 'New password must be different from current password',
          variant: 'destructive',
        })
        return
      }

      await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      })

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      })

      // Clear the form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      })
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">
          Current Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative mt-1">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="newPassword">
          New Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative mt-1">
          <Input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Password must be at least 6 characters long
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">
          Confirm New Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative mt-1">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isChanging} className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          {isChanging ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </form>
  )
}