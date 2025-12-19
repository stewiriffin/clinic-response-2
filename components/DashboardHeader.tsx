'use client'

import { LucideIcon } from 'lucide-react'

interface DashboardHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  gradient: string
  iconColor: string
}

export function DashboardHeader({
  icon: Icon,
  title,
  subtitle,
  gradient,
  iconColor
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        <div>
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
