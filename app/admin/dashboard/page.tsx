'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/admin/StatsCard'
import { UserGrowthChart, AppointmentVolumeChart, ActivityHeatmap, ChartSkeleton } from '@/components/admin/Charts'
import {
  Users,
  Activity,
  Calendar,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DashboardMetrics {
  totalUsers: number
  activeToday: number
  totalAppointments: number
  pendingAppointments: number
  userGrowth: string
  appointmentGrowth: string
}

interface ChartData {
  userGrowth: Array<{ date: string; users: number }>
  appointmentVolume: Array<{ month: string; current: number; previous: number }>
  activity: Array<{ hour: string; activity: number }>
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    fetchMetrics()
    fetchChartData()
    fetchRecentActivity()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const res = await fetch('/api/admin/moderation?limit=5')
      if (res.ok) {
        const data = await res.json()
        setRecentActivity(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  const fetchChartData = async () => {
    setChartsLoading(true)
    try {
      const res = await fetch('/api/admin/charts')
      if (res.ok) {
        const data = await res.json()
        setChartData(data)
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setChartsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-red-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="mt-1 text-slate-400">
          Monitor system health and user activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          change={metrics?.userGrowth || '+0%'}
          changeType="positive"
          icon={Users}
          iconColor="bg-blue-500"
          description="All registered users"
        />
        <StatsCard
          title="Active Today"
          value={metrics?.activeToday || 0}
          icon={UserCheck}
          iconColor="bg-green-500"
          description="Users active in last 24h"
        />
        <StatsCard
          title="Total Appointments"
          value={metrics?.totalAppointments || 0}
          change={metrics?.appointmentGrowth || '+0%'}
          changeType="positive"
          icon={Calendar}
          iconColor="bg-purple-500"
          description="All time appointments"
        />
        <StatsCard
          title="Pending Appointments"
          value={metrics?.pendingAppointments || 0}
          icon={Clock}
          iconColor="bg-orange-500"
          description="Awaiting confirmation"
        />
      </div>

      {/* 📊 Interactive Charts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          Analytics & Insights
        </h2>

        {chartsLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        ) : chartData ? (
          <div className="grid gap-6">
            {/* User Growth Chart - Full Width */}
            <UserGrowthChart data={chartData.userGrowth} />

            {/* Appointment Volume and Activity - Side by Side */}
            <div className="grid gap-6 lg:grid-cols-2">
              <AppointmentVolumeChart data={chartData.appointmentVolume} />
              <ActivityHeatmap data={chartData.activity} />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <p className="text-slate-400">Failed to load chart data</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <Activity className="h-5 w-5 text-slate-400" />
        </div>

        {recentActivity.length === 0 ? (
          <p className="py-8 text-center text-slate-500">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="rounded-full bg-blue-500/10 p-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {activity.action}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activity.user} • {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/users"
          className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-blue-500 hover:bg-slate-900"
        >
          <Users className="mb-3 h-8 w-8 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Manage Users</h3>
          <p className="mt-1 text-sm text-slate-400">
            View and manage all system users
          </p>
        </a>

        <a
          href="/admin/moderation"
          className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-purple-500 hover:bg-slate-900"
        >
          <AlertCircle className="mb-3 h-8 w-8 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Content Moderation</h3>
          <p className="mt-1 text-sm text-slate-400">
            Monitor and moderate user activity
          </p>
        </a>

        <a
          href="/admin/alerts"
          className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-green-500 hover:bg-slate-900"
        >
          <CheckCircle className="mb-3 h-8 w-8 text-green-400" />
          <h3 className="text-lg font-semibold text-white">System Alerts</h3>
          <p className="mt-1 text-sm text-slate-400">
            Broadcast notifications to users
          </p>
        </a>
      </div>
    </div>
  )
}
