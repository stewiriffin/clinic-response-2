'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CommandPalette } from './CommandPalette'
import {
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  ChevronDown,
  Activity,
  Clock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getRoleBadgeColor, getRoleDisplayName, type AdminRoleType } from '@/lib/permissions'

export function AdminHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const adminRole = (session?.user as any)?.adminRole as AdminRoleType | undefined
  const userName = session?.user?.name || 'Admin User'
  const userEmail = session?.user?.email || ''

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Admin Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 via-red-600 to-orange-600 shadow-lg shadow-red-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Admin Control Center</h1>
              <p className="text-xs text-slate-500">First Response Clinic</p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-slate-800" />

          {/* Live Clock */}
          <div className="hidden items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-1.5 lg:flex">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-300">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Center: Command Palette */}
        <div className="hidden md:flex">
          <CommandPalette />
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-3">
          {/* Activity Indicator */}
          <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            <Activity className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
          </button>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {/* Settings Quick Link */}
          <button
            onClick={() => router.push('/admin/settings')}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Separator */}
          <div className="h-8 w-px bg-slate-800" />

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 transition-all hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-14 z-50 w-72 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
                  {/* User Info */}
                  <div className="border-b border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{userName}</p>
                        <p className="text-xs text-slate-400">{userEmail}</p>
                      </div>
                    </div>

                    {/* Role Badge */}
                    {adminRole && (
                      <div className="mt-3">
                        <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${getRoleBadgeColor(adminRole)}`}>
                          <Shield className="h-3 w-3" />
                          <span className="text-xs font-semibold">
                            {getRoleDisplayName(adminRole)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="border-b border-slate-800 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">Session Time</p>
                        <p className="mt-1 text-sm font-semibold text-white">2h 34m</p>
                      </div>
                      <div className="rounded-lg bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">Actions Today</p>
                        <p className="mt-1 text-sm font-semibold text-white">27</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        router.push('/admin/settings')
                        setShowDropdown(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </button>
                    <button
                      onClick={() => {
                        router.push('/admin/audit-logs')
                        setShowDropdown(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      <Activity className="h-4 w-4" />
                      My Activity
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-slate-800 p-2">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Command Palette */}
      <div className="border-t border-slate-800 p-3 md:hidden">
        <CommandPalette />
      </div>
    </header>
  )
}
