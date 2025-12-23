'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { EnhancedUserTable } from '@/components/admin/EnhancedUserTable'
import { Search, Filter, RefreshCw, Download } from 'lucide-react'
import Papa from 'papaparse'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import { useDebounce } from '@/hooks/useDebounce'

interface User {
  _id: string
  email: string
  fullName: string
  role: string
  createdAt: string
  isBanned?: boolean
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const debouncedSearch = useDebounce(searchQuery, 300)

  /**
   * Fetch users with pagination
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users?limit=100&page=1')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || data.data || [])
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useRealTimeUpdates({
    channel: 'users',
    events: {
      'user-created': fetchUsers,
      'user-updated': fetchUsers,
      'user-deleted': fetchUsers,
    },
  })

  const filteredUsers = useMemo(() => {
    let filtered = [...users]
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    return filtered
  }, [users, debouncedSearch, roleFilter])

  const exportToCSV = useCallback(() => {
    const csvData = filteredUsers.map((user) => ({
      ID: user._id,
      'Full Name': user.fullName,
      Email: user.email,
      Role: user.role,
      Status: user.isBanned ? 'Banned' : 'Active',
      'Created At': new Date(user.createdAt).toLocaleDateString(),
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredUsers])

  const roles = ['Admin', 'Doctor', 'Nurse', 'Pharmacist', 'Lab technician', 'Receptionist']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="mt-1 text-slate-400">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-10 pr-10 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Filtered Results</p>
          <p className="mt-1 text-2xl font-bold text-white">{filteredUsers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Active Users</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {users.filter((u) => !u.isBanned).length}
          </p>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">No users found</p>
        </div>
      ) : (
        <EnhancedUserTable users={filteredUsers} onRefresh={fetchUsers} />
      )}
    </div>
  )
}
