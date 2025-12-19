'use client'

import { useEffect, useState } from 'react'
import { AuditTable } from '@/components/admin/AuditTable'
import { RefreshCw, Filter, Download, Shield, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface AuditLog {
  _id: string
  adminEmail: string
  adminName: string
  action: string
  actionType: 'create' | 'update' | 'delete' | 'ban' | 'promote' | 'reset_password' | 'alert' | 'other'
  targetType: 'user' | 'appointment' | 'system' | 'content'
  targetEmail?: string
  targetName?: string
  details?: string
  ipAddress?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface Stats {
  totalActions: number
  criticalActions: number
  uniqueAdmins: string[]
  actionTypes: string[]
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionTypeFilter, setActionTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLogs()
  }, [actionTypeFilter, severityFilter, page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (actionTypeFilter !== 'all') params.append('actionType', actionTypeFilter)
      if (severityFilter !== 'all') params.append('severity', severityFilter)

      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setStats(data.stats)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Type', 'Target', 'Severity', 'Details', 'IP']
    const rows = logs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.adminName,
      log.adminEmail,
      log.action,
      log.actionType,
      log.targetEmail || log.targetName || '-',
      log.severity,
      log.details || '-',
      log.ipAddress || '-'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const actionTypes = ['create', 'update', 'delete', 'ban', 'promote', 'reset_password', 'alert', 'other']
  const severities = ['low', 'medium', 'high', 'critical']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="mt-1 text-slate-400">
            Complete record of all administrative actions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Total Actions</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {stats?.totalActions || 0}
          </p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-sm text-red-400">Critical Actions</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-white">
            {stats?.criticalActions || 0}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-400" />
            <p className="text-sm text-slate-400">Active Admins</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-white">
            {stats?.uniqueAdmins.length || 0}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Showing</p>
          <p className="mt-1 text-2xl font-bold text-white">{logs.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <select
            value={actionTypeFilter}
            onChange={(e) => {
              setActionTypeFilter(e.target.value)
              setPage(1)
            }}
            className="appearance-none rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-10 pr-10 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Action Types</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <AlertTriangle className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value)
              setPage(1)
            }}
            className="appearance-none rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-10 pr-10 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Severities</option>
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-purple-500" />
        </div>
      ) : (
        <AuditTable logs={logs} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
