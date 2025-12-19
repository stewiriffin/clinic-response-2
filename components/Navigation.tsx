'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  Home, Calendar, Activity, Users, LogOut, Menu, X,
  Stethoscope, Pill, TestTube, ClipboardList, UserCog, LayoutDashboard,
  ChevronRight, Heart
} from 'lucide-react'

const roleIcons: Record<string, any> = {
  Admin: UserCog,
  Doctor: Stethoscope,
  Nurse: ClipboardList,
  Pharmacist: Pill,
  'Lab technician': TestTube,
  Receptionist: Users,
}

const roleRoutes: Record<string, { dashboard: string; label: string }> = {
  admin: { dashboard: '/admin/dashboard', label: 'Admin Dashboard' },
  doctor: { dashboard: '/doctor/dashboard', label: 'Doctor Dashboard' },
  nurse: { dashboard: '/nurse', label: 'Nurse Dashboard' },
  pharmacist: { dashboard: '/pharmacist/dashboard', label: 'Pharmacist Dashboard'},
  lab_technician: { dashboard: '/lab/dashboard', label: 'Lab Dashboard' },
  receptionist: { dashboard: '/receptionist/dashboard', label: 'Receptionist Dashboard' },
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const userRole = session?.user?.role
    ? String(session.user.role).toLowerCase().replace(/\s+/g, '_')
    : null

  const dashboardRoute = userRole ? roleRoutes[userRole] : null

  // Public navigation (no session)
  const publicNav = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/book', label: 'Book', icon: Calendar },
    { href: '/status', label: 'Status', icon: Activity },
  ]

  // Authenticated navigation
  const authenticatedNav = [
    { href: '/', label: 'Home', icon: Home },
    ...(dashboardRoute
      ? [{ href: dashboardRoute.dashboard, label: 'Dashboard', icon: LayoutDashboard }]
      : []),
    { href: '/book', label: 'Book', icon: Calendar },
    { href: '/status', label: 'Status', icon: Activity },
  ]

  const navItems = session ? authenticatedNav : publicNav

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Heart className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-bold text-white hidden sm:inline">
                First Response
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      {userRole && roleIcons[session.user.role!] ? (
                        React.createElement(roleIcons[session.user.role!], {
                          className: 'w-4 h-4 text-white',
                        })
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {session.user.name}
                      </span>
                      <span className="text-xs text-slate-400">{session.user.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                )
              })}

              {session && (
                <>
                  <div className="border-t border-slate-800 my-4"></div>
                  <div className="px-4 py-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                          {session.user.name}
                        </span>
                        <span className="text-xs text-slate-400">{session.user.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navigation
