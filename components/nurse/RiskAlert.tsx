'use client'

import { AlertTriangle, AlertCircle } from 'lucide-react'

interface RiskAlertProps {
  riskLevel: 'normal' | 'warning' | 'critical'
  message?: string
  className?: string
}

export default function RiskAlert({ riskLevel, message, className = '' }: RiskAlertProps) {
  if (riskLevel === 'normal') return null

  const config = {
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/40',
      text: 'text-yellow-300',
      icon: AlertCircle,
      label: 'Warning - Abnormal Vitals'
    },
    critical: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/40',
      text: 'text-red-300',
      icon: AlertTriangle,
      label: 'CRITICAL ALERT'
    }
  }

  const { bg, border, text, icon: Icon, label } = config[riskLevel]

  return (
    <div className={`${bg} ${border} border-2 rounded-lg p-4 flex items-start gap-3 animate-pulse ${className}`}>
      <Icon className={`w-6 h-6 ${text} flex-shrink-0 mt-0.5`} />
      <div>
        <h4 className={`font-bold ${text} mb-1`}>{label}</h4>
        <p className={`text-sm ${text}`}>
          {message || 'Patient requires immediate attention. Review vitals and notify doctor.'}
        </p>
      </div>
    </div>
  )
}
