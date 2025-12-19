'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface VitalsSparklineProps {
  data: Array<{ value: number; timestamp: Date }>
  label: string
  unit: string
  normalRange?: { min: number; max: number }
  type?: 'temperature' | 'bloodPressure' | 'pulse' | 'oxygen'
}

export default function VitalsSparkline({
  data,
  label,
  unit,
  normalRange,
  type = 'temperature'
}: VitalsSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-3 bg-slate-800/30 border border-slate-600/30 rounded-lg">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm text-slate-500">No history available</p>
      </div>
    )
  }

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const latest = values[values.length - 1]
  const previous = values.length > 1 ? values[values.length - 2] : latest

  // Calculate trend
  const trend = latest > previous ? 'up' : latest < previous ? 'down' : 'stable'
  const trendPercent = previous !== 0 ? ((latest - previous) / previous * 100).toFixed(1) : '0'

  // Normalize values for chart (0-100 scale)
  const range = max - min || 1
  const normalizedValues = values.map(v => ((v - min) / range) * 100)

  // Check if current value is in normal range
  const isNormal = normalRange
    ? latest >= normalRange.min && latest <= normalRange.max
    : true

  const getStatusColor = () => {
    if (!isNormal) return 'text-red-400 border-red-500/50 bg-red-500/10'
    if (trend === 'up') return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'
    if (trend === 'down') return 'text-blue-400 border-blue-500/50 bg-blue-500/10'
    return 'text-green-400 border-green-500/50 bg-green-500/10'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  return (
    <div className={`p-3 border rounded-lg ${getStatusColor()} transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium opacity-80">{label}</p>
        <div className="flex items-center gap-1 text-xs">
          {getTrendIcon()}
          <span>{trend === 'stable' ? '—' : `${trendPercent}%`}</span>
        </div>
      </div>

      {/* Current Value */}
      <div className="mb-2">
        <span className="text-2xl font-bold">{latest}</span>
        <span className="text-xs ml-1 opacity-70">{unit}</span>
      </div>

      {/* Sparkline Chart */}
      <div className="relative h-8 mb-2">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Background grid */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

          {/* Normal range indicator (if provided) */}
          {normalRange && (
            <rect
              x="0"
              y={((max - normalRange.max) / range) * 100}
              width="100"
              height={(((normalRange.max - normalRange.min) / range) * 100)}
              fill="currentColor"
              opacity="0.1"
            />
          )}

          {/* Sparkline path */}
          <polyline
            points={normalizedValues.map((v, i) =>
              `${(i / (normalizedValues.length - 1)) * 100},${100 - v}`
            ).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {normalizedValues.map((v, i) => (
            <circle
              key={i}
              cx={(i / (normalizedValues.length - 1)) * 100}
              cy={100 - v}
              r="2"
              fill="currentColor"
              opacity={i === normalizedValues.length - 1 ? 1 : 0.5}
            />
          ))}
        </svg>
      </div>

      {/* Range Info */}
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>Min: {min}{unit}</span>
        <span>Max: {max}{unit}</span>
      </div>

      {/* Warning if out of range */}
      {!isNormal && normalRange && (
        <div className="mt-2 pt-2 border-t border-current/20">
          <p className="text-xs font-medium">
            ⚠️ Outside normal range ({normalRange.min}-{normalRange.max}{unit})
          </p>
        </div>
      )}
    </div>
  )
}
