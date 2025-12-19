'use client'

import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Calendar, Activity, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Simple gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/30 via-slate-950 to-purple-950/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-[85vh] flex items-center justify-center px-6">
          <div className="max-w-4xl w-full text-center">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                First Response Clinic
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Modern healthcare queue management system
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/status"
                className="group px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" />
                <span>Check Queue Status</span>
              </Link>
            </div>

            {/* Staff Login Link */}
            <div className="mt-12">
              <Link
                href="/login"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Staff Login →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}
