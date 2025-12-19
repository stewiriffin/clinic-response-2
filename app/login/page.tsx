'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight, Shield } from 'lucide-react'

const roleRoutes: Record<string, string> = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  nurse: '/nurse',
  pharmacist: '/pharmacist/dashboard',
  receptionist: '/receptionist/dashboard',
  lab_technician: '/lab/dashboard',
}

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  pharmacist: 'Pharmacist',
  receptionist: 'Receptionist',
  lab_technician: 'Lab Technician',
}

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ 
    email?: string
    password?: string 
  }>({})
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  })

  const validate = useCallback(() => {
    const errs: { email?: string; password?: string } = {}
    
    if (!formData.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      errs.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errs.password = 'Must be at least 6 characters'
    }
    
    return errs
  }, [formData.email, formData.password])

  useEffect(() => {
    const message = searchParams?.get('message')
    if (message === 'registered') {
      setSuccessMessage('Account created successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } else if (message === 'verified') {
      setSuccessMessage('Email verified successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role && !isLoading) {
      const userRole = String(session.user.role).toLowerCase().replace(/\s+/g, '_')
      const redirectTo = searchParams?.get('callbackUrl') || roleRoutes[userRole] || '/hub'
      router.push(redirectTo)
    } else if (status === 'authenticated' && !session?.user?.role) {
      setError('User role is missing. Contact administrator.')
      setIsLoading(false)
    }
  }, [status, session, router, isLoading, searchParams])

  const handleBlur = useCallback((field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errs = validate()
    setValidationErrors((prev) => ({ ...prev, [field]: errs[field] }))
  }, [validate])

  const handleInput = useCallback((key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setError('')
    setSuccessMessage('')
    
    if (key === 'email' || key === 'password') {
      setValidationErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSuccessMessage('')
      
      setTouched({ email: true, password: true })
      
      const errs = validate()
      if (Object.keys(errs).length) {
        setValidationErrors(errs)
        return
      }

      setIsLoading(true)
      
      try {
        const res = await signIn('credentials', {
          redirect: false,
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        })

        if (res?.error) {
          const errorMessage = res.error.includes('CredentialsSignin') 
            ? 'Invalid credentials. Please try again.' 
            : res.error
          setError(errorMessage)
          setIsLoading(false)
        } else if (res?.ok) {
          setSuccessMessage('Success! Redirecting...')
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
        setIsLoading(false)
      }
    },
    [formData, validate]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any)
    }
  }, [handleSubmit, isLoading])

  if (status === 'loading' || (status === 'authenticated' && session?.user?.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          </div>
          <p className="text-gray-600 font-medium">
            {status === 'loading' ? 'Loading your session...' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-white">First Response</span>
          </div>

          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Modern Healthcare Management
            </h1>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-8 text-blue-100">
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm">Healthcare Facilities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm">Support Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">First Response</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5" noValidate>
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  I am a
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInput('role', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  disabled={isLoading}
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInput('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@example.com"
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-4 transition-all outline-none ${
                    validationErrors.email && touched.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {validationErrors.email && touched.email && (
                  <p className="text-sm text-red-600 mt-2">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInput('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-4 transition-all outline-none ${
                      validationErrors.password && touched.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && touched.password && (
                  <p className="text-sm text-red-600 mt-2">{validationErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInput('rememberMe', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <a 
                  href="/forgot-password" 
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Need an account?{' '}
              <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Register
              </a>
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Secure authentication
          </p>
        </div>
      </div>
    </div>
  )
}
