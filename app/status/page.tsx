'use client'

import { useState, useEffect } from 'react'
import { Search, CheckCircle2, AlertCircle, Loader2, User, Phone, Clock, TrendingUp, Sparkles, Zap, Activity } from 'lucide-react'

interface StatusData {
  queueNumber: number
  status: string
}

export default function CheckStatus() {
  const [fullName, setFullName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [status, setStatus] = useState<StatusData | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    duration: number
    delay: number
  }>>([])
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 3
    }))
    setParticles(newParticles)
  }, [])

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers.slice(0, 10)
  }

  const validatePhone = (value: string): boolean => {
    return value.length === 10 && /^0[17]\d{8}$/.test(value)
  }

  const getStatusColor = (statusText: string): string => {
    const lower = statusText?.toLowerCase() || ''
    if (lower.includes('complete') || lower.includes('ready')) return 'from-green-400 to-emerald-500'
    if (lower.includes('process') || lower.includes('progress')) return 'from-blue-400 to-cyan-500'
    if (lower.includes('wait') || lower.includes('queue')) return 'from-yellow-400 to-orange-500'
    return 'from-purple-400 to-pink-500'
  }

  const getStatusIcon = (statusText: string) => {
    const lower = statusText?.toLowerCase() || ''
    if (lower.includes('complete') || lower.includes('ready')) return CheckCircle2
    if (lower.includes('process') || lower.includes('progress')) return Activity
    if (lower.includes('wait') || lower.includes('queue')) return Clock
    return TrendingUp
  }

  const handleCheck = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit Kenyan mobile number (e.g., 0712345678)')
      return
    }
    
    setStatus(null)
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      try {
        const demoStatuses: StatusData[] = [
          { queueNumber: 42, status: 'Processing' },
          { queueNumber: 15, status: 'Ready for Pickup' },
          { queueNumber: 89, status: 'In Queue' },
          { queueNumber: 23, status: 'Complete' }
        ]
        
        const randomStatus = demoStatuses[Math.floor(Math.random() * demoStatuses.length)]
        
        if (Math.random() > 0.3) {
          setStatus(randomStatus)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        } else {
          setError('Could not find your record. Please verify your details and try again.')
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && fullName.trim() && phone.length === 10 && !isLoading) {
      handleCheck()
    }
  }

  const StatusIcon = status ? getStatusIcon(status.status) : null
  const isFormValid = fullName.trim() && phone.length === 10

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-purple-400/40 to-pink-400/40 animate-float backdrop-blur-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-600/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${50 + (Math.random() - 0.5) * 60}%`,
                top: '-20px',
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                background: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                           'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                           'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                           'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                           'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'][i % 5],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 0.4}s`,
                animationDuration: `${2.5 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl opacity-75 blur-xl animate-pulse-slow"></div>
        
        <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-60 animate-pulse-slow"></div>
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Queue Status Check
              </h1>
              <p className="text-slate-400 text-sm">Enter your details to view your queue position</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  <User className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:bg-slate-800/70"
                    aria-required="true"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  <Phone className="w-3.5 h-3.5 text-pink-400" aria-hidden="true" />
                  Phone Number
                </label>
                <div className="relative group">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    onKeyDown={handleKeyDown}
                    maxLength={10}
                    placeholder="0712345678"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 hover:bg-slate-800/70"
                    aria-required="true"
                    aria-describedby="phone-help"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <p id="phone-help" className="flex items-center gap-1.5 text-xs text-slate-500 ml-1">
                  <Zap className="w-3 h-3" aria-hidden="true" />
                  10-digit Kenyan mobile (07XX or 01XX)
                </p>
              </div>

              <button
                onClick={handleCheck}
                disabled={isLoading || !isFormValid}
                className="relative w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
                aria-live="polite"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Checking Status...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                      Check Status
                    </>
                  )}
                </span>
              </button>
            </div>

            {status && (
              <div 
                className="mt-6 p-5 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl backdrop-blur-sm animate-scale-in relative overflow-hidden"
                role="status"
                aria-live="polite"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400"></div>
                <div className="flex items-start gap-4">
                  {StatusIcon && (
                    <div className={`p-2.5 bg-gradient-to-br ${getStatusColor(status.status)} rounded-lg shadow-lg flex-shrink-0`}>
                      <StatusIcon className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base text-emerald-100 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Status Found
                    </h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-xs text-slate-400 font-medium">Queue Number</span>
                        <span className="font-bold text-2xl text-emerald-400">
                          #{status.queueNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <span className="text-xs text-slate-400 font-medium">Status</span>
                        <span className={`font-semibold text-sm px-3 py-1 rounded-md bg-gradient-to-r ${getStatusColor(status.status)} text-white shadow-md`}>
                          {status.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div 
                className="mt-6 p-5 bg-gradient-to-br from-red-500/10 via-rose-500/10 to-pink-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake relative overflow-hidden"
                role="alert"
                aria-live="assertive"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 via-rose-400 to-pink-400"></div>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base text-red-100 mb-1">Unable to Find Record</h2>
                    <p className="text-sm text-red-200/80 leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-20px) translateX(10px) scale(1.1); }
          66% { transform: translateY(10px) translateX(-10px) scale(0.9); }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(40px, -60px) scale(1.15) rotate(120deg); }
          66% { transform: translate(-30px, 30px) scale(0.85) rotate(240deg); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 12s infinite ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        .animate-confetti {
          animation: confetti forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}