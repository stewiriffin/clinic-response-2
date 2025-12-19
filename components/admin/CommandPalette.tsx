'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Search,
  Users,
  Settings,
  Activity,
  FileText,
  Ban,
  UserPlus,
  KeyRound,
  TrendingUp,
  AlertCircle,
  Home,
  Shield,
} from 'lucide-react'

interface User {
  _id: string
  email: string
  fullName: string
  role: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Search users when search query changes
  useEffect(() => {
    if (search.length > 0 && open) {
      searchUsers()
    } else {
      setUsers([])
    }
  }, [search, open])

  const searchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }, [search])

  const handleSelect = (callback: () => void) => {
    setOpen(false)
    setSearch('')
    callback()
  }

  // Navigation items
  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard', keywords: 'home overview' },
    { icon: Users, label: 'User Management', href: '/admin/users', keywords: 'users people manage' },
    { icon: Activity, label: 'Content Moderation', href: '/admin/moderation', keywords: 'moderate content' },
    { icon: AlertCircle, label: 'System Alerts', href: '/admin/alerts', keywords: 'alerts notifications' },
    { icon: FileText, label: 'Audit Logs', href: '/admin/audit-logs', keywords: 'logs audit history' },
    { icon: Settings, label: 'Settings', href: '/admin/settings', keywords: 'settings config system' },
  ]

  // Action items
  const actions = [
    { icon: Ban, label: 'Ban User', keywords: 'ban block suspend', callback: () => router.push('/admin/users') },
    { icon: UserPlus, label: 'Promote to Admin', keywords: 'promote admin elevate', callback: () => router.push('/admin/users') },
    { icon: KeyRound, label: 'Reset Password', keywords: 'password reset', callback: () => router.push('/admin/users') },
    { icon: TrendingUp, label: 'View Analytics', keywords: 'analytics stats metrics', callback: () => router.push('/admin/dashboard') },
    { icon: Shield, label: 'System Controls', keywords: 'system maintenance lockdown', callback: () => router.push('/admin/settings') },
  ]

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-400 transition-all hover:border-slate-600 hover:bg-slate-900 hover:text-slate-300"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-400 sm:inline">
          {typeof window !== 'undefined' && navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'}K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center border-b border-slate-800 px-4">
          <Search className="h-5 w-5 text-slate-500" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search users..."
            className="flex-1 bg-transparent px-4 py-4 text-white placeholder-slate-500 outline-none"
          />
        </div>

        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="py-12 text-center text-sm text-slate-500">
            {loading ? 'Searching...' : 'No results found'}
          </Command.Empty>

          {/* Pages */}
          <Command.Group heading="Pages" className="mb-2">
            {navItems.map((item) => (
              <Command.Item
                key={item.href}
                keywords={[item.keywords]}
                onSelect={() => handleSelect(() => router.push(item.href))}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 aria-selected:bg-slate-800"
              >
                <item.icon className="h-4 w-4 text-slate-500" />
                <span>{item.label}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Actions */}
          <Command.Group heading="Actions" className="mb-2">
            {actions.map((action) => (
              <Command.Item
                key={action.label}
                keywords={[action.keywords]}
                onSelect={() => handleSelect(action.callback)}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 aria-selected:bg-slate-800"
              >
                <action.icon className="h-4 w-4 text-slate-500" />
                <span>{action.label}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Users */}
          {users.length > 0 && (
            <Command.Group heading="Users" className="mb-2">
              {users.map((user) => (
                <Command.Item
                  key={user._id}
                  onSelect={() => handleSelect(() => router.push(`/admin/users?search=${user.email}`))}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 aria-selected:bg-slate-800"
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <div className="font-medium text-white">{user.fullName}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                  <span className="text-xs text-slate-600">{user.role}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Navigate with ↑↓ arrows, select with ↵ Enter</span>
            <span>ESC to close</span>
          </div>
        </div>
      </Command.Dialog>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
