'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Search, Clock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface RapidResponseHeaderProps {
  nurseName: string
  onCodeBlue: () => void
  onSearch: () => void
  shiftEndTime?: Date
}

export default function RapidResponseHeader({
  nurseName,
  onCodeBlue,
  onSearch,
  shiftEndTime
}: RapidResponseHeaderProps) {
  const [codeBlueHoldProgress, setCodeBlueHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  // Calculate shift timer
  useEffect(() => {
    if (!shiftEndTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = shiftEndTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Shift Ended')
        clearInterval(interval)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeRemaining(`${hours}h ${minutes}m until shift end`)
    }, 1000)

    return () => clearInterval(interval)
  }, [shiftEndTime])

  // Code Blue long-press handler
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isHolding) {
      interval = setInterval(() => {
        setCodeBlueHoldProgress(prev => {
          if (prev >= 100) {
            setIsHolding(false)
            triggerCodeBlue()
            return 0
          }
          return prev + 10
        })
      }, 100)
    } else {
      setCodeBlueHoldProgress(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isHolding])

  const triggerCodeBlue = () => {
    toast.error('CODE BLUE ACTIVATED', {
      duration: 5000,
      style: {
        background: '#991b1b',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    })
    onCodeBlue()
  }

  const handleCodeBlueMouseDown = () => {
    setIsHolding(true)
  }

  const handleCodeBlueMouseUp = () => {
    if (codeBlueHoldProgress < 100) {
      toast('Hold for 1 second to activate Code Blue', {
        duration: 2000
      })
    }
    setIsHolding(false)
  }

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearch])

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 border-b border-red-500/30 shadow-lg shadow-red-500/10">
      <div className="max-w-full mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Nurse Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-400">On Duty</p>
              <p className="text-sm font-semibold text-white">{nurseName}</p>
            </div>
          </div>

          {/* Center: Quick Actions */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            {/* Code Blue Button */}
            <button
              onMouseDown={handleCodeBlueMouseDown}
              onMouseUp={handleCodeBlueMouseUp}
              onMouseLeave={handleCodeBlueMouseUp}
              onTouchStart={handleCodeBlueMouseDown}
              onTouchEnd={handleCodeBlueMouseUp}
              className="relative group"
            >
              <div
                className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                  isHolding
                    ? 'bg-red-700 scale-95'
                    : 'bg-red-600 hover:bg-red-700 hover:scale-105'
                } shadow-lg shadow-red-500/50`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>CODE BLUE</span>
                </div>
              </div>

              {/* Progress bar */}
              {isHolding && (
                <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${codeBlueHoldProgress}%` }}
                />
              )}

              {/* Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Hold for 1 second to activate
              </div>
            </button>

            {/* Quick Search */}
            <button
              onClick={onSearch}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline px-2 py-0.5 bg-white/20 rounded text-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Shift Timer */}
          {shiftEndTime && (
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">{timeRemaining}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
