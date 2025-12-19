'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// User Growth Area Chart
interface UserGrowthChartProps {
  data: Array<{ date: string; users: number }>
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-bold text-white">User Growth (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#334155' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Appointment Volume Bar Chart
interface AppointmentVolumeChartProps {
  data: Array<{ month: string; current: number; previous: number }>
}

export function AppointmentVolumeChart({ data }: AppointmentVolumeChartProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-bold text-white">Appointment Volume Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#334155' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
          />
          <Legend
            wrapperStyle={{ color: '#94a3b8' }}
            iconType="circle"
          />
          <Bar dataKey="previous" fill="#64748b" name="Last Month" radius={[4, 4, 0, 0]} />
          <Bar dataKey="current" fill="#8b5cf6" name="This Month" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Activity Heatmap (Simplified as a bar chart showing hourly activity)
interface ActivityHeatmapProps {
  data: Array<{ hour: string; activity: number }>
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-bold text-white">Platform Activity by Hour</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="hour"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#334155' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar
            dataKey="activity"
            fill="#10b981"
            name="Activity"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Skeleton Loader Component
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-slate-800" />
      <div className="space-y-3">
        <div className="h-64 animate-pulse rounded bg-slate-800" />
      </div>
    </div>
  )
}
