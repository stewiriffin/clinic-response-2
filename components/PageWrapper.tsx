'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function PageWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Pages that hide navigation (no top padding needed)
  const hideNav =
    pathname?.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/maintenance' ||
    pathname?.startsWith('/nurse') ||
    pathname?.startsWith('/doctor/dashboard') ||
    pathname?.startsWith('/lab/dashboard') ||
    pathname?.startsWith('/pharmacist/dashboard') ||
    pathname?.startsWith('/receptionist')

  // Add top padding for pages that show the navigation header (64px/16 = h-16)
  return (
    <div className={hideNav ? '' : 'pt-16'}>
      {children}
    </div>
  )
}
