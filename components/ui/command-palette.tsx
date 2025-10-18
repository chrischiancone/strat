'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Search,
  FileText,
  Users,
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  Target,
  Building2,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  // Keyboard shortcut to open command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  // Navigation commands
  const navigationCommands = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      action: () => router.push('/dashboard'),
    },
    {
      title: 'Strategic Plans',
      icon: FileText,
      action: () => router.push('/plans'),
    },
    {
      title: 'Initiatives',
      icon: Target,
      action: () => router.push('/initiatives/new'),
    },
    {
      title: 'Finance',
      icon: DollarSign,
      action: () => router.push('/finance'),
    },
    {
      title: 'Calendar',
      icon: Calendar,
      action: () => router.push('/dashboard'),
    },
  ]

  // Admin commands
  const adminCommands = [
    {
      title: 'Users',
      icon: Users,
      action: () => router.push('/admin/users'),
    },
    {
      title: 'Departments',
      icon: Building2,
      action: () => router.push('/admin/departments'),
    },
    {
      title: 'Fiscal Years',
      icon: Calendar,
      action: () => router.push('/admin/fiscal-years'),
    },
    {
      title: 'Settings',
      icon: Settings,
      action: () => router.push('/admin/settings'),
    },
    {
      title: 'Audit Logs',
      icon: FileText,
      action: () => router.push('/admin/audit-logs'),
    },
  ]

  // User commands
  const userCommands = [
    {
      title: 'Profile Settings',
      icon: Settings,
      action: () => router.push('/profile'),
    },
    {
      title: 'Notifications',
      icon: Bell,
      action: () => router.push('/settings/notifications'),
    },
    {
      title: 'Sign Out',
      icon: LogOut,
      action: () => router.push('/login'),
    },
  ]

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[var(--z-index-modal)] bg-black/50 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div className="fixed left-1/2 top-[20%] w-full max-w-2xl -translate-x-1/2 transform px-4">
        <Command
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b border-gray-200 px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-500"
            />
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-xs font-medium text-gray-600 sm:flex">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="mb-2">
              {navigationCommands.map((command) => {
                const Icon = command.icon
                return (
                  <Command.Item
                    key={command.title}
                    onSelect={() => runCommand(command.action)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm',
                      'hover:bg-gray-100 aria-selected:bg-gray-100',
                      'transition-colors duration-150'
                    )}
                  >
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span>{command.title}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-gray-200" />

            <Command.Group heading="Admin" className="mb-2">
              {adminCommands.map((command) => {
                const Icon = command.icon
                return (
                  <Command.Item
                    key={command.title}
                    onSelect={() => runCommand(command.action)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm',
                      'hover:bg-gray-100 aria-selected:bg-gray-100',
                      'transition-colors duration-150'
                    )}
                  >
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span>{command.title}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-gray-200" />

            <Command.Group heading="User">
              {userCommands.map((command) => {
                const Icon = command.icon
                return (
                  <Command.Item
                    key={command.title}
                    onSelect={() => runCommand(command.action)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm',
                      'hover:bg-gray-100 aria-selected:bg-gray-100',
                      'transition-colors duration-150'
                    )}
                  >
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span>{command.title}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>
          </Command.List>

          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono">↵</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono">⌘K</kbd>
                <span>to toggle</span>
              </div>
            </div>
          </div>
        </Command>
      </div>
    </div>
  )
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)

  return {
    open,
    setOpen,
    toggle: () => setOpen((prev) => !prev),
  }
}
