'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Target,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Settings,
  FileText,
  TrendingUp,
  Gift,
  BarChart3,
  Flag,
  Plus,
  Menu,
  X,
} from 'lucide-react'

interface SidebarProps {
  userRole?: string
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[] // If undefined, visible to all
}

const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Strategic Plans', href: '/plans', icon: Target },
  { name: 'Add Initiative', href: '/initiatives/new', icon: Plus, roles: ['admin', 'city_manager', 'department_director'] },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const financeNavigation: NavItem[] = [
  { name: 'Initiative Budgets', href: '/finance', icon: DollarSign, roles: ['finance', 'admin', 'city_manager', 'department_director'] },
  { name: 'Funding Sources', href: '/finance/funding-sources', icon: TrendingUp, roles: ['finance', 'admin', 'city_manager', 'department_director'] },
  { name: 'Budget Categories', href: '/finance/categories', icon: BarChart3, roles: ['finance', 'admin', 'city_manager', 'department_director'] },
  { name: 'Grant Tracking', href: '/finance/grants', icon: Gift, roles: ['finance', 'admin', 'city_manager', 'department_director'] },
]

const adminNavigation: NavItem[] = [
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
  { name: 'Departments', href: '/admin/departments', icon: Building2, roles: ['admin'] },
  { name: 'Council Goals', href: '/admin/council-goals', icon: Flag, roles: ['admin'] },
  { name: 'Fiscal Years', href: '/admin/fiscal-years', icon: Calendar, roles: ['admin'] },
  { name: 'System Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText, roles: ['admin'] },
]

export function Sidebar({ userRole, isMobileMenuOpen = false, setIsMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname()

  const canViewItem = (item: NavItem): boolean => {
    if (!item.roles) return true
    if (!userRole) return false
    return item.roles.includes(userRole)
  }

  // Close mobile menu on navigation
  const handleNavClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        onClick={handleNavClick}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${
            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        />
        <span className="truncate">{item.name}</span>
      </Link>
    )
  }

  const visibleFinanceNav = financeNavigation.filter(canViewItem)
  const visibleAdminNav = adminNavigation.filter(canViewItem)

  const SidebarContent = () => (
    <nav className="flex flex-col gap-6 p-4 h-full overflow-y-auto">
      {/* Main Navigation */}
      <div>
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Main
        </h3>
        <div className="flex flex-col gap-1">
          {mainNavigation.filter(canViewItem).map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>
      </div>

      {/* Finance Navigation */}
      {visibleFinanceNav.length > 0 && (
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Finance
          </h3>
          <div className="flex flex-col gap-1">
            {visibleFinanceNav.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Admin Navigation */}
      {visibleAdminNav.length > 0 && (
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Administration
          </h3>
          <div className="flex flex-col gap-1">
            {visibleAdminNav.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      )}
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform">
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-sm">
                  <span className="text-sm font-bold text-white">SP</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
