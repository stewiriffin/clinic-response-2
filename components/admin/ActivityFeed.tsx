'use client'

import { useState } from 'react'
import { Flag, Trash2, Calendar, User, Activity, Loader2, AlertTriangle } from 'lucide-react'

interface ActivityItem {
  _id: string
  type: 'appointment' | 'user_action' | 'system'
  action: string
  user: string
  userEmail: string
  timestamp: string
  details?: string
  flagged?: boolean
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  onRefresh: () => void
}

export function ActivityFeed({ activities, onRefresh }: ActivityFeedProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<{ action: string; id: string } | null>(null)

  const handleFlag = async (activityId: string) => {
    setLoading(activityId)
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'flag', activityId })
      })

      if (res.ok) {
        onRefresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to flag activity')
      }
    } catch (error) {
      console.error('Error flagging activity:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
      setShowConfirm(null)
    }
  }

  const handleDelete = async (activityId: string) => {
    setLoading(activityId)
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', activityId })
      })

      if (res.ok) {
        onRefresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete activity')
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
      setShowConfirm(null)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />
      case 'user_action':
        return <User className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-500/10 text-blue-400'
      case 'user_action':
        return 'bg-purple-500/10 text-purple-400'
      default:
        return 'bg-slate-500/10 text-slate-400'
    }
  }

  return (
    <>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className={`rounded-lg border ${
              activity.flagged ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800 bg-slate-950/50'
            } p-4 transition-all hover:border-slate-700`}
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-full p-2 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-white">{activity.action}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {activity.user} • {activity.userEmail}
                    </p>
                    {activity.details && (
                      <p className="mt-2 text-sm text-slate-500">{activity.details}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activity.flagged && (
                      <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        Flagged
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm({ action: 'flag', id: activity._id })}
                  disabled={loading === activity._id || activity.flagged}
                  className={`rounded-lg p-2 transition-colors ${
                    activity.flagged
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-orange-400 hover:bg-orange-500/10'
                  } disabled:opacity-50`}
                  title={activity.flagged ? 'Already flagged' : 'Flag for review'}
                >
                  {loading === activity._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flag className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => setShowConfirm({ action: 'delete', id: activity._id })}
                  disabled={loading === activity._id}
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  title="Delete activity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white">Confirm Action</h3>
            <p className="mt-2 text-slate-400">
              {showConfirm.action === 'flag' && 'Are you sure you want to flag this activity for review?'}
              {showConfirm.action === 'delete' && 'Are you sure you want to delete this activity? This action cannot be undone.'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirm.action === 'flag') {
                    handleFlag(showConfirm.id)
                  } else if (showConfirm.action === 'delete') {
                    handleDelete(showConfirm.id)
                  }
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
