'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export function AdminBreadcrumb() {
  const pathname = usePathname()

  // Parse pathname into breadcrumb segments
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter(segment => segment !== 'admin')

  // Map segment to readable name
  const getSegmentName = (segment: string) => {
    const nameMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'users': 'User Management',
      'moderation': 'Content Moderation',
      'alerts': 'System Alerts',
      'settings': 'Settings',
      'audit-logs': 'Audit Logs',
    }
    return nameMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Build breadcrumb path
  const buildPath = (index: number) => {
    return '/admin/' + segments.slice(0, index + 1).join('/')
  }

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
    return null // Don't show breadcrumb on dashboard
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      {/* Home */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {/* Segments */}
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const path = buildPath(index)

        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-slate-600" />
            {isLast ? (
              <span className="font-semibold text-white">
                {getSegmentName(segment)}
              </span>
            ) : (
              <Link
                href={path}
                className="text-slate-400 transition-colors hover:text-white"
              >
                {getSegmentName(segment)}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
