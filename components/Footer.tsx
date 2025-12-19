'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold">First Response Clinic</span>
          </div>

          {/* Links */}
          <div className="flex gap-6">
            <Link href="/book" className="hover:text-white transition-colors">
              Book
            </Link>
            <Link href="/status" className="hover:text-white transition-colors">
              Status
            </Link>
            <Link href="/hub" className="hover:text-white transition-colors">
              Hub
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Staff Login
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-slate-500">
            © {currentYear} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
