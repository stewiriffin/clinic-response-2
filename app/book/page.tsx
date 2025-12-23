'use client'

import { useState, useEffect } from 'react'
import { Footer } from '@/components/Footer'

export default function BookPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [doctorType, setDoctorType] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!touched.email || !email) return
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
  }, [email, touched.email])

  useEffect(() => {
    if (!touched.phone || !phone) return
    const phoneRegex = /^0[17]\d{8}$/
    if (!phoneRegex.test(phone)) {
      setErrors(prev => ({ ...prev, phone: 'Phone must be 10 digits (07XX or 01XX)' }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.phone
        return newErrors
      })
    }
  }, [phone, touched.phone])

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  async function handleSubmit() {
    setMessage('')
    setIsSubmitting(true)

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      reason: true,
      doctorType: true
    })

    const newErrors: { [key: string]: string } = {}
    if (!fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!phone.trim()) newErrors.phone = 'Phone number is required'
    if (!reason) newErrors.reason = 'Please select a reason'
    if (!doctorType) newErrors.doctorType = 'Please select a doctor'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, reason, doctorType }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`Success! Your queue number is ${result.data.queueNumber}`)
        setFullName('')
        setEmail('')
        setPhone('')
        setReason('')
        setDoctorType('')
        setErrors({})
        setTouched({})
      } else {
        if (result.errors) {
          const fieldErrors: { [key: string]: string } = {}
          result.errors.forEach((err: any) => {
            fieldErrors[err.field] = err.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ general: result.error || 'Something went wrong. Please try again.' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formFields = [
    { 
      label: 'Full Name', 
      type: 'text', 
      value: fullName, 
      setValue: setFullName, 
      field: 'fullName', 
      placeholder: 'John Doe',
      icon: '👤'
    },
    { 
      label: 'Email Address', 
      type: 'email', 
      value: email, 
      setValue: setEmail, 
      field: 'email', 
      placeholder: 'john.doe@example.com',
      icon: '✉️'
    },
    { 
      label: 'Phone Number', 
      type: 'tel', 
      value: phone, 
      setValue: setPhone, 
      field: 'phone', 
      placeholder: '0712345678', 
      maxLength: 10,
      icon: '📱'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-24 pb-8">
        <main className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeIn">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-3 shadow-lg animate-bounce-slow">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Book Your Appointment
          </h1>
          <p className="text-gray-600">
            Your health is our priority. Quick and easy booking.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideDown shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <p className="text-green-800 font-semibold">{message}</p>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideDown shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-red-800 font-semibold">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {formFields.map((field, idx) => (
            <div key={field.field} className="animate-slideUp" style={{ animationDelay: `${idx * 100}ms` }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                  {field.icon}
                </span>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  onBlur={() => handleBlur(field.field)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength ?? undefined}
                  disabled={isSubmitting}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all duration-200 outline-none ${
                    errors[field.field] && touched[field.field]
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
              </div>
              {errors[field.field] && touched[field.field] && (
                <p className="mt-1 text-sm text-red-600 flex items-center animate-fadeIn">
                  <span className="mr-1">⚠</span>
                  {errors[field.field]}
                </p>
              )}
            </div>
          ))}

          <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Visit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg z-10 pointer-events-none">
                🩺
              </span>
              <select 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => handleBlur('reason')}
                disabled={isSubmitting}
                className={`w-full pl-12 pr-10 py-3 border-2 rounded-lg transition-all duration-200 outline-none appearance-none bg-white ${
                  errors.reason && touched.reason
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                } disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer`}
              >
                <option value=''>Select reason for visit</option>
                <option value='Emergency'>🚨 Emergency</option>
                <option value='Consultation'>💬 Consultation</option>
                <option value='Follow-up'>📋 Follow-up</option>
                <option value='Routine Check-up'>✓ Routine Check-up</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </span>
            </div>
            {errors.reason && touched.reason && (
              <p className="mt-1 text-sm text-red-600 flex items-center animate-fadeIn">
                <span className="mr-1">⚠</span>
                {errors.reason}
              </p>
            )}
          </div>

          <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Doctor Type
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg z-10 pointer-events-none">
                👨‍⚕️
              </span>
              <select 
                value={doctorType} 
                onChange={(e) => setDoctorType(e.target.value)}
                onBlur={() => handleBlur('doctorType')}
                disabled={isSubmitting}
                className={`w-full pl-12 pr-10 py-3 border-2 rounded-lg transition-all duration-200 outline-none appearance-none bg-white ${
                  errors.doctorType && touched.doctorType
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                } disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer`}
              >
                <option value=''>Select a doctor specialist</option>
                <option value='General Physician'>General Physician</option>
                <option value='Gynecologist'>Gynecologist</option>
                <option value='Surgeon'>Surgeon</option>
                <option value='Pediatrician'>Pediatrician</option>
                <option value='Dentist'>Dentist</option>
                <option value='Cardiologist'>Cardiologist</option>
                <option value='Neurologist'>Neurologist</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </span>
            </div>
            {errors.doctorType && touched.doctorType && (
              <p className="mt-1 text-sm text-red-600 flex items-center animate-fadeIn">
                <span className="mr-1">⚠</span>
                {errors.doctorType}
              </p>
            )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              '🚀 Book Appointment Now'
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center">
          <span className="mr-1">🔒</span>
          Your information is secure and confidential
        </p>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 30px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out backwards;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
      `}</style>

      {/* Footer */}
      <Footer />
    </div>
  )
}