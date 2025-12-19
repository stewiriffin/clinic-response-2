'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname || '/')

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1

        return (
          <Fragment key={item.href}>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            {isLast ? (
              <span className="text-white font-semibold">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Remove leading/trailing slashes and split
  const segments = pathname.replace(/^\/|\/$/g, '').split('/')

  if (segments.length === 0 || (segments.length === 1 && segments[0] === '')) {
    return []
  }

  // Map route segments to readable labels
  const labelMap: Record<string, string> = {
    admin: 'Admin',
    doctor: 'Doctor',
    nurse: 'Nurse',
    pharmacist: 'Pharmacist',
    lab: 'Lab',
    receptionist: 'Receptionist',
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    patients: 'Patients',
    users: 'Users',
    settings: 'Settings',
    profile: 'Profile',
    book: 'Book Appointment',
    status: 'Queue Status',
    patient: 'Patient Portal',
    login: 'Login',
    'audit-logs': 'Audit Logs',
    metrics: 'Metrics',
    vitals: 'Vitals',
    diagnosis: 'Diagnosis',
    prescriptions: 'Prescriptions',
    dispense: 'Dispense',
    tests: 'Lab Tests',
  }

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''

  segments.forEach((segment) => {
    currentPath += `/${segment}`
    breadcrumbs.push({
      label: labelMap[segment] || capitalizeFirst(segment),
      href: currentPath,
    })
  })

  return breadcrumbs
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
