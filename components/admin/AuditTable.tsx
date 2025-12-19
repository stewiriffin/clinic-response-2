'use client'

import { format } from 'date-fns'
import { Shield, Trash2, Ban, UserPlus, Key, AlertTriangle, Info, AlertCircle } from 'lucide-react'

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

interface AuditTableProps {
  logs: AuditLog[]
}

export function AuditTable({ logs }: AuditTableProps) {
  const getActionIcon = (actionType: string) => {
    const iconClass = "h-4 w-4"
    switch (actionType) {
      case 'delete':
        return <Trash2 className={iconClass} />
      case 'ban':
        return <Ban className={iconClass} />
      case 'promote':
        return <UserPlus className={iconClass} />
      case 'reset_password':
        return <Key className={iconClass} />
      case 'alert':
        return <AlertCircle className={iconClass} />
      default:
        return <Info className={iconClass} />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const badges = {
      low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return badges[severity as keyof typeof badges] || badges.low
  }

  const getActionColor = (actionType: string) => {
    const colors = {
      delete: 'bg-red-500/10 text-red-400',
      ban: 'bg-orange-500/10 text-orange-400',
      promote: 'bg-purple-500/10 text-purple-400',
      reset_password: 'bg-yellow-500/10 text-yellow-400',
      alert: 'bg-blue-500/10 text-blue-400',
      other: 'bg-slate-500/10 text-slate-400',
    }
    return colors[actionType as keyof typeof colors] || colors.other
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full">
        <thead className="border-b border-slate-800 bg-slate-900/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Timestamp
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Action
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Target
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Severity
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {logs.map((log) => (
            <tr key={log._id} className="bg-slate-950/50 transition-colors hover:bg-slate-900/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-slate-400">
                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <p className="font-medium text-white">{log.adminName}</p>
                  <p className="text-slate-400">{log.adminEmail}</p>
                  {log.ipAddress && (
                    <p className="text-xs text-slate-500 mt-1">{log.ipAddress}</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getActionColor(log.actionType)}`}>
                  {getActionIcon(log.actionType)}
                  <span>{log.action}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {log.targetEmail || log.targetName ? (
                  <div className="text-sm">
                    {log.targetName && (
                      <p className="font-medium text-white">{log.targetName}</p>
                    )}
                    {log.targetEmail && (
                      <p className="text-slate-400">{log.targetEmail}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">—</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityBadge(log.severity)}`}>
                  {log.severity === 'critical' && <AlertTriangle className="h-3 w-3" />}
                  <span className="capitalize">{log.severity}</span>
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-300 max-w-md truncate">
                  {log.details || '—'}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && (
        <div className="p-12 text-center text-slate-500">
          No audit logs found
        </div>
      )}
    </div>
  )
}
