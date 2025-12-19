'use client'

import { ReactNode } from 'react'
import { Breadcrumb } from './Breadcrumb'
import { LucideIcon } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface StatCard {
  label: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'cyan'
  trend?: {
    value: string
    isPositive: boolean
  }
}

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  stats?: StatCard[]
  actions?: ReactNode
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20'
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    iconBg: 'bg-green-500/20'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/20'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    iconBg: 'bg-red-500/20'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20'
  }
}

export function DashboardLayout({
  children,
  title,
  description,
  breadcrumbs,
  stats,
  actions
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {breadcrumbs && (
          <div className="mb-6">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-slate-400 text-lg">{description}</p>
            )}
          </div>
          {actions && (
            <div className="mt-4 md:mt-0">
              {actions}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const colors = colorVariants[stat.color]

              return (
                <div
                  key={index}
                  className={`bg-white/5 backdrop-blur-md border ${colors.border} rounded-2xl p-6 hover:border-white/30 transition-all group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center border ${colors.border}`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    {stat.trend && (
                      <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        stat.trend.isPositive
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {stat.trend.isPositive ? '+' : ''}{stat.trend.value}
                      </div>
                    )}
                  </div>
                  <p className={`text-3xl font-black ${colors.text} mb-2`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
