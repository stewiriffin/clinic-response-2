'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Shield,
  Bell,
  Settings,
  Activity,
  ChevronRight,
  LogOut,
  UserCog,
  FileText
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { hasPermission, Permissions, type AdminRoleType } from '@/lib/permissions'

const navItems = [
  {
    title: 'Overview',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard metrics & analytics',
    permission: Permissions.VIEW_ANALYTICS,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users, roles & permissions',
    permission: Permissions.VIEW_USERS,
  },
  {
    title: 'Content Moderation',
    href: '/admin/moderation',
    icon: Shield,
    description: 'Monitor activity & moderate content',
    permission: Permissions.VIEW_CONTENT,
  },
  {
    title: 'System Alerts',
    href: '/admin/alerts',
    icon: Bell,
    description: 'Broadcast notifications to users',
    permission: Permissions.SEND_ALERTS,
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
    description: 'View admin activity logs',
    permission: Permissions.VIEW_AUDIT_LOGS,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration',
    permission: Permissions.SYSTEM_SETTINGS,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  // Get admin role from session
  const adminRole = (session?.user as any)?.adminRole as AdminRoleType | undefined

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item =>
    hasPermission(adminRole, item.permission)
  )

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-800 bg-slate-950">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
          <UserCog className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <p className="text-xs text-slate-400">
            {adminRole ? adminRole.replace(/([A-Z])/g, ' $1').trim() : 'System Management'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? 'bg-red-500/10 text-red-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isActive ? 'text-red-400' : 'text-slate-200'}`}>
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 truncate">{item.description}</p>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
