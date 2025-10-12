'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { updateUserProfile } from '@/app/actions/profile'
import { useToast } from '@/hooks/use-toast'
import { User, Building2, MapPin, Shield } from 'lucide-react'

interface Department {
  id: string
  name: string
}

interface UserProfile {
  id: string
  full_name: string
  email: string
  preferences: { [key: string]: any } | null
  role: string
  department_id: string | null
  municipality_id: string
  departments: { name: string } | null
  municipalities: { name: string } | null
}

interface ProfileFormProps {
  user: UserProfile
  departments: Department[]
  currentUserRole: string
}

export function ProfileForm({ user, departments, currentUserRole }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [fullName, setFullName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const [phone, setPhone] = useState((user.preferences?.phone as string) || '')
  const [mobile, setMobile] = useState((user.preferences?.mobile as string) || '')
  const [departmentId, setDepartmentId] = useState(user.department_id || 'none')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validation
      if (!fullName.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Full name is required',
          variant: 'destructive',
        })
        return
      }

      if (!email.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Email is required',
          variant: 'destructive',
        })
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid email address',
          variant: 'destructive',
        })
        return
      }

      await updateUserProfile({
        id: user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        mobile: mobile.trim() || null,
        department_id: departmentId === 'none' ? null : departmentId,
      })

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      city_manager: { label: 'City Manager', color: 'bg-purple-100 text-purple-800' },
      department_director: { label: 'Department Director', color: 'bg-blue-100 text-blue-800' },
      finance: { label: 'Finance', color: 'bg-green-100 text-green-800' },
      staff: { label: 'Staff', color: 'bg-gray-100 text-gray-800' },
    }[role] || { label: role, color: 'bg-gray-100 text-gray-800' }

    return (
      <Badge className={`${roleConfig.color} border-0`}>
        {roleConfig.label}
      </Badge>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., (555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g., (555) 987-6543"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Details
          </CardTitle>
          <CardDescription>
            Your role and department within the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Role</Label>
            <div className="mt-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              {getRoleBadge(user.role)}
              <span className="text-sm text-gray-500">
                (Contact your administrator to change your role)
              </span>
            </div>
          </div>

          <div>
            <Label>Municipality</Label>
            <div className="mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">
                {user.municipalities?.name || 'Unknown Municipality'}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your department..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Current: {user.departments?.name || 'No department assigned'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}