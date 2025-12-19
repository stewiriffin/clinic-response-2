'use client'

import { useEffect, useState } from 'react'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { RefreshCw, Filter, AlertTriangle } from 'lucide-react'

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

export default function ContentModerationPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, typeFilter, showFlaggedOnly])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/moderation?limit=50')
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [])
      } else {
        console.error('Failed to fetch activities')
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = [...activities]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((activity) => activity.type === typeFilter)
    }

    // Flagged filter
    if (showFlaggedOnly) {
      filtered = filtered.filter((activity) => activity.flagged)
    }

    setFilteredActivities(filtered)
  }

  const flaggedCount = activities.filter((a) => a.flagged).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Moderation</h1>
          <p className="mt-1 text-slate-400">
            Monitor user activity and moderate content
          </p>
        </div>
        <button
          onClick={fetchActivities}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Total Activities</p>
          <p className="mt-1 text-2xl font-bold text-white">{activities.length}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">Flagged Items</p>
          <p className="mt-1 text-2xl font-bold text-white">{flaggedCount}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Filtered Results</p>
          <p className="mt-1 text-2xl font-bold text-white">{filteredActivities.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Type Filter */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-700 bg-slate-900/50 py-2 pl-10 pr-10 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">All Types</option>
              <option value="appointment">Appointments</option>
              <option value="user_action">User Actions</option>
              <option value="system">System Events</option>
            </select>
          </div>

          {/* Flagged Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={(e) => setShowFlaggedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            <span className="text-sm text-slate-300 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Show Flagged Only
            </span>
          </label>
        </div>
      </div>

      {/* Activity Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-purple-500" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">No activities found</p>
        </div>
      ) : (
        <ActivityFeed activities={filteredActivities} onRefresh={fetchActivities} />
      )}
    </div>
  )
}
