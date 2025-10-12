'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Search, Trash2, Download, Users, Calendar, Pill, Activity, X, AlertCircle
} from 'lucide-react'

type User = {
  _id: string
  fullName: string
  email: string
  role: Role
  status?: 'active' | 'inactive'
  createdAt?: string
}

type Log = {
  actorEmail: string
  action: string
  timestamp: string
  type?: 'create' | 'update' | 'delete' | 'login'
}

type Metrics = {
  users: number
  appointments: number
  prescriptions: number
  todayAppointments: number
}

const roles = [
  'admin',
  'doctor',
  'nurse',
  'pharmacist',
  'lab technician',
  'receptionist',
] as const

type Role = (typeof roles)[number]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [metrics, setMetrics] = useState<Metrics>({
    users: 0,
    appointments: 0,
    prescriptions: 0,
    todayAppointments: 0,
  })
  
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview')
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && session?.user?.role !== 'Admin') {
      signOut({ callbackUrl: '/login' })
    }
  }, [status, session, router])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [usersRes, metricsRes, logsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/admin/metrics'),
        fetch('/api/admin/audit-logs'),
      ])
      if (!usersRes.ok || !metricsRes.ok || !logsRes.ok) {
        throw new Error('Failed to fetch')
      }

      const [usersData, metricsData, logsData] = await Promise.all([
        usersRes.json(),
        metricsRes.json(),
        logsRes.json(),
      ])

      setUsers(Array.isArray(usersData) ? usersData : [])
      setMetrics(metricsData)
      setLogs(Array.isArray(logsData) ? logsData.slice(0, 50) : [])
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, fetchData])

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(
      (u) =>
        (!search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
        (!roleFilter || roleFilter === 'all' || u.role === roleFilter) &&
        (statusFilter === 'all' || u.status === statusFilter)
    )

    return filtered.sort((a, b) => {
      return (a.fullName || '').localeCompare(b.fullName || '')
    })
  }, [users, search, roleFilter, statusFilter])

  const roleCounts = useMemo(() => {
    return roles.reduce((acc, r) => {
      acc[r] = users.filter((u) => u.role === r).length
      return acc
    }, {} as Record<Role, number>)
  }, [users])

  const updateUserRole = async (id: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error()
      setSuccess(`User role updated to ${newRole}`)
      setTimeout(() => setSuccess(null), 3000)
      fetchData()
    } catch {
      setError('Failed to update user role.')
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setSuccess('User deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
      setDeleteUserId(null)
      fetchData()
    } catch {
      setError('Failed to delete user.')
    }
  }

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status'].join(','),
      ...filteredUsers.map(u => [u.fullName, u.email, u.role, u.status || 'active'].join(',')),
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${Date.now()}.csv`
    a.click()
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  if (status === 'loading' || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading dashboard</p>
        </div>
      </div>
    )

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage users, appointments, and system activity</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Logout
          </button>
        </header>
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess(null)} />
        )}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Users" 
            value={metrics.users} 
            icon={<Users className="w-6 h-6" />}
          />
          <MetricCard 
            title="Appointments" 
            value={metrics.appointments} 
            icon={<Calendar className="w-6 h-6" />}
          />
          <MetricCard 
            title="Prescriptions" 
            value={metrics.prescriptions} 
            icon={<Pill className="w-6 h-6" />}
          />
          <MetricCard 
            title="Today's Visits" 
            value={metrics.todayAppointments} 
            icon={<Activity className="w-6 h-6" />}
          />
        </section>
        <div className="flex gap-4 border-b border-gray-200">
          {(['users', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'users' ? 'Users' : 'Audit Logs'}
            </button>
          ))}
        </div>
        {activeTab === 'users' && (
          <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportUsers}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    <Download size={18} />
                    Export
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    <X size={18} />
                    Clear Filters
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl">
                <SearchInput
                  placeholder="Search by name or email"
                  value={search}
                  onChange={setSearch}
                  icon={<Search size={18} />}
                />
                <FilterSelect
                  label="Role"
                  value={roleFilter}
                  onChange={(v) => setRoleFilter(v as Role | 'all')}
                  options={[{ label: 'All Roles', value: 'all' }, ...roles.map(r => ({ label: r, value: r }))]}
                />
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v as any)}
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                />
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="font-semibold text-gray-900">
                  Showing {filteredUsers.length} of {users.length} users
                </span>
                <span className="text-gray-600">|</span>
                {roles.map((r) => (
                  <span key={r} className="text-gray-700">
                    <span className="font-medium">{r}:</span> {roleCounts[r]}
                  </span>
                ))}
              </div>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">No users found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value as Role)}
                              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {roles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (user.status || 'active') === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setDeleteUserId(user._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
        {activeTab === 'logs' && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Logs</h2>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No audit logs available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((l, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{l.action}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        By <span className="font-medium">{l.actorEmail}</span>
                        {l.type && ` • ${l.type}`}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      {deleteUserId && (
        <Modal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={() => deleteUser(deleteUserId)}
          onCancel={() => setDeleteUserId(null)}
          isDangerous
        />
      )}
    </main>
  )
}

const MetricCard = ({ 
  title, 
  value,
  icon
}: { 
  title: string
  value: number
  icon: React.ReactNode
}) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-gray-600 font-medium text-sm">{title}</p>
        <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className="text-blue-500 opacity-30">
        {icon}
      </div>
    </div>
  </div>
)

const SearchInput = ({
  placeholder,
  value,
  onChange,
  icon,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon?: React.ReactNode
}) => (
  <div className="relative">
    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2 ${icon ? 'pl-10' : ''} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
    />
  </div>
)

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ label: string; value: string }>
}) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

const Alert = ({ 
  type, 
  message, 
  onClose 
}: { 
  type: 'error' | 'success'
  message: string
  onClose: () => void
}) => (
  <div className={`p-4 rounded-lg flex items-center justify-between gap-4 ${
    type === 'error' 
      ? 'bg-red-50 border border-red-200' 
      : 'bg-green-50 border border-green-200'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-white ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      }`}>
        {type === 'error' ? '!' : '✓'}
      </div>
      <p className={`font-medium ${
        type === 'error' ? 'text-red-700' : 'text-green-700'
      }`}>
        {message}
      </p>
    </div>
    <button
      onClick={onClose}
      className={`text-lg font-bold ${
        type === 'error' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
      }`}
    >
      ×
    </button>
  </div>
)

const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg font-medium transition-colors text-white ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isDangerous ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
)
