'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'

interface SidebarProps {
  userRole?: string
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

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const canViewItem = (item: NavItem): boolean => {
    if (!item.roles) return true
    if (!userRole) return false
    return item.roles.includes(userRole)
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        />
        <span>{item.name}</span>
      </Link>
    )
  }

  const visibleFinanceNav = financeNavigation.filter(canViewItem)
  const visibleAdminNav = adminNavigation.filter(canViewItem)

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <nav className="flex flex-col gap-6 p-4">
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
    </aside>
  )
}
