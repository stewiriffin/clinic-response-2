'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  BarChart3, Users, Settings, LogOut, Menu, X, Plus,
  Search, Filter, Download, Trash2, AlertCircle, CheckCircle,
  TrendingUp, Activity, Calendar, Pill, ChevronDown, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
}

interface Metrics {
  totalUsers: number
  totalAppointments: number
  totalPrescriptions: number
  todayAppointments: number
  activeUsers: number
  revenue?: number
}

interface AuditLog {
  _id: string
  actorEmail: string
  action: string
  resource: string
  resourceId: string
  timestamp: string
  ipAddress?: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/login')
    }
  }, [status, session, router])

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [usersRes, metricsRes, logsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/metrics'),
        fetch('/api/admin/logs'),
      ])

      if (!usersRes.ok || !metricsRes.ok || !logsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [usersData, metricsData, logsData] = await Promise.all([
        usersRes.json(),
        metricsRes.json(),
        logsRes.json(),
      ])

      setUsers(usersData)
      setMetrics(metricsData)
      setLogs(logsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [status, fetchData])

  // Actions
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) throw new Error()
      toast.success('Role updated successfully')
      fetchData()
    } catch {
      toast.error('Failed to update user role')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error()
      toast.success('User deleted successfully')
      setDeleteConfirm(null)
      fetchData()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error()
      toast.success(`User ${newStatus}`)
      fetchData()
    } catch {
      toast.error('Failed to update user status')
    }
  }

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Created'].join(','),
      ...filteredUsers.map(u =>
        [u.fullName, u.email, u.role, u.status, new Date(u.createdAt).toLocaleDateString()].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${Date.now()}.csv`
    a.click()
  }

  // Filtering & Sorting
  const filteredUsers = useMemo(() => {
    let result = users

    if (searchQuery) {
      result = result.filter(u =>
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter)
    }

    return result.sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName)
      if (sortBy === 'email') return a.email.localeCompare(b.email)
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return 0
    })
  }, [users, searchQuery, roleFilter, statusFilter, sortBy])

  const roleStats = useMemo(() => {
    const stats: Record<string, number> = {}
    users.forEach(u => {
      stats[u.role] = (stats[u.role] || 0) + 1
    })
    return stats
  }, [users])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full bg-white/10 mb-4">
            <Activity className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-white font-semibold text-lg">Loading Dashboard</p>
          <p className="text-slate-400 text-sm mt-2">Initializing admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-800/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 z-40 lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'logs', label: 'Audit Logs', icon: Activity },
            ].map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all border border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-slate-800/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1 hidden sm:flex">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{session?.user?.email}</span>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                {session?.user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
                <StatCard
                  label="Total Users"
                  value={metrics.totalUsers}
                  icon={<Users className="w-6 h-6" />}
                  color="from-blue-500 to-blue-600"
                />
                <StatCard
                  label="Total Appointments"
                  value={metrics.totalAppointments}
                  icon={<Calendar className="w-6 h-6" />}
                  color="from-purple-500 to-purple-600"
                />
                <StatCard
                  label="Total Prescriptions"
                  value={metrics.totalPrescriptions}
                  icon={<Pill className="w-6 h-6" />}
                  color="from-orange-500 to-orange-600"
                />
                <StatCard
                  label="Today's Appointments"
                  value={metrics.todayAppointments}
                  icon={<Activity className="w-6 h-6" />}
                  color="from-green-500 to-green-600"
                />
              </div>

              {/* Role Distribution */}
              <div className="bg-slate-800/30 backdrop-blur border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6">User Distribution by Role</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(roleStats).map(([role, count]) => (
                    <div key={role} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-sm text-slate-300 capitalize mb-1">{role}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-slate-800/30 backdrop-blur border border-white/10 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-48 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
                  />

                  <select
                    value={roleFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="lab_technician">Lab Tech</option>
                    <option value="receptionist">Receptionist</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="created">Sort by Created</option>
                  </select>

                  <button
                    onClick={exportUsers}
                    className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/20 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>

              {/* Users Table */}
              <div className="bg-slate-800/30 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-700/50 border-b border-white/10">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(user => (
                        <tr key={user._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{user.fullName}</td>
                          <td className="px-6 py-4 text-slate-300 text-sm">{user.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                updateUserRole(user._id, e.target.value)
                              }
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500/50"
                            >
                              <option>admin</option>
                              <option>doctor</option>
                              <option>nurse</option>
                              <option>pharmacist</option>
                              <option>lab_technician</option>
                              <option>receptionist</option>
                              <option>patient</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.status)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                user.status === 'active'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-slate-500/20 text-slate-300'
                              }`}
                            >
                              {user.status}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setDeleteConfirm(user._id)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {logs.map(log => (
                    <div
                      key={log._id}
                      className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors last:border-0"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <p className="font-medium text-white">{log.action}</p>
                          <p className="text-sm text-slate-400">
                            {log.actorEmail} • {log.resource}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Delete User</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ label, value, icon, color }: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) => (
  <div className={`bg-gradient-to-br ${color} bg-opacity-10 backdrop-blur border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all h-full`}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-white/10 rounded-lg">
        <div className="text-white opacity-80">{icon}</div>
      </div>
    </div>
    <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
)