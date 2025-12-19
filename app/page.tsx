'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/Footer'
import {
  Activity, Calendar, Users, Clock, ArrowRight, Sparkles,
  CheckCircle, Zap, Shield, Stethoscope, Phone, MapPin,
  ChevronRight, Star, TrendingUp
} from 'lucide-react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
                animation: `float ${5 + Math.random() * 15}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-6 py-20 pt-24">
          <div className="max-w-5xl w-full">
            <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {/* Badge */}
              <div className="mb-8 flex justify-center">
                <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span className="text-sm font-medium text-slate-300">Revolutionary Healthcare Experience</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Healthcare
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Without Waiting
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience modern healthcare management. Real-time queue tracking, instant appointments, and intelligent patient flow optimization.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/book" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg overflow-hidden shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <Calendar className="w-6 h-6" />
                    <span>Book Appointment</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/status" className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 text-white rounded-xl font-bold text-lg overflow-hidden transition-all transform hover:scale-105">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <Activity className="w-6 h-6" />
                    <span>Check Status</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 mb-12">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>24/7 Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>1000+ Active Users</span>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Instant Booking"
                description="Reserve your spot in seconds with intelligent slot allocation"
                color="from-yellow-500 to-orange-500"
              />
              <FeatureCard
                icon={<Clock className="w-8 h-8" />}
                title="Real-Time Tracking"
                description="Monitor your queue position and estimated wait time live"
                color="from-blue-500 to-cyan-500"
              />
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Smart Queue Management"
                description="AI-optimized scheduling minimizes wait times"
                color="from-purple-500 to-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-6 py-20 md:py-32 bg-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  Why Choose First Response?
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Built for both patients and healthcare professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BenefitCard
                icon={<Stethoscope className="w-6 h-6" />}
                title="For Patients"
                points={[
                  'No more endless waiting',
                  'Transparent queue position',
                  'Mobile-friendly booking',
                  'Appointment history'
                ]}
              />
              <BenefitCard
                icon={<Users className="w-6 h-6" />}
                title="For Doctors"
                points={[
                  'Organized patient flow',
                  'Complete medical history',
                  'Prescription management',
                  'Vital tracking'
                ]}
              />
              <BenefitCard
                icon={<Shield className="w-6 h-6" />}
                title="For Clinic"
                points={[
                  'Reduce no-shows',
                  'Optimize resource usage',
                  'Real-time analytics',
                  'Staff coordination'
                ]}
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 py-20 md:py-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatBox number="1000+" label="Active Patients" />
            <StatBox number="50+" label="Healthcare Partners" />
            <StatBox number="99.9%" label="Uptime Guaranteed" />
            <StatBox number="24/7" label="Customer Support" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 py-20 md:py-32 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 backdrop-blur-md border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of patients enjoying faster, smarter healthcare
            </p>
            <Link href="/book" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/50">
              <Calendar className="w-6 h-6" />
              <span>Book Your Appointment Today</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
      `}</style>
    </main>
  )
}

const FeatureCard = ({ icon, title, description, color }: any) => (
  <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300 overflow-hidden">
    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-4 text-white`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
)

const BenefitCard = ({ icon, title, points }: any) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <ul className="space-y-3">
      {points.map((point: string, i: number) => (
        <li key={i} className="flex items-center gap-3 text-slate-300">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  </div>
)

const StatBox = ({ number, label }: any) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center hover:border-white/30 transition-all duration-300">
    <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">
      {number}
    </p>
    <p className="text-slate-400">{label}</p>
  </div>
)