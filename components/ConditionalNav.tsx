'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './Navigation'

export function ConditionalNav() {
  const pathname = usePathname()

  // Don't show navigation on:
  // - Admin routes (have their own layout)
  // - Login page (dedicated login UI)
  // - Maintenance page
  // - Nurse dashboard (has its own internal navigation/sidebar)
  // - Doctor dashboard (full-screen clinical interface)
  // - Lab dashboard (full-screen lab interface)
  // - Pharmacist dashboard (full-screen pharmacy interface)
  // - Receptionist routes (both page and dashboard have their own layouts)
  const hideNav =
    pathname?.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/maintenance' ||
    pathname?.startsWith('/nurse') ||
    pathname?.startsWith('/doctor/dashboard') ||
    pathname?.startsWith('/lab/dashboard') ||
    pathname?.startsWith('/pharmacist/dashboard') ||
    pathname?.startsWith('/receptionist')

  if (hideNav) return null

  return <Navigation />
}
