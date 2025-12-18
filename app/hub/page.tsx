'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Activity, Users, ClipboardList,
  Stethoscope, Pill, TestTube, FileText, Search,
  Heart, Thermometer, Printer, ArrowRight, Shield,
  LogIn, Home
} from 'lucide-react'

const publicLinks = [
  {
    title: 'Home',
    description: 'Return to homepage',
    href: '/',
    icon: Home,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Book Appointment',
    description: 'Schedule a new appointment',
    href: '/book',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Check Queue Status',
    description: 'View current queue and wait times',
    href: '/status',
    icon: Activity,
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Patient Portal',
    description: 'Track your appointments',
    href: '/patient',
    icon: Search,
    color: 'from-orange-500 to-red-500'
  },
  {
    title: 'Staff Login',
    description: 'Access staff dashboard',
    href: '/login',
    icon: LogIn,
    color: 'from-slate-500 to-slate-600'
  }
]

const roleLinks: Record<string, any[]> = {
  doctor: [
    {
      title: 'Doctor Dashboard',
      description: 'View and manage patient appointments',
      href: '/doctor/dashboard',
      icon: Stethoscope,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Patient Records',
      description: 'Access patient medical history',
      href: '/patient',
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    }
  ],
  nurse: [
    {
      title: 'Nurse Dashboard',
      description: 'Record vitals and patient notes',
      href: '/nurse/dashboard',
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Nurse Overview',
      description: 'View quick stats and guidelines',
      href: '/nurse',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Record Vitals',
      description: 'Take patient vital signs',
      href: '/nurse/dashboard',
      icon: Thermometer,
      color: 'from-orange-500 to-orange-600'
    }
  ],
  pharmacist: [
    {
      title: 'Pharmacist Dashboard',
      description: 'Dispense medications',
      href: '/pharmacist/dashboard',
      icon: Pill,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Prescriptions',
      description: 'View and manage prescriptions',
      href: '/pharmacist/dashboard',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    }
  ],
  lab_technician: [
    {
      title: 'Lab Dashboard',
      description: 'Manage lab tests and results',
      href: '/lab/dashboard',
      icon: TestTube,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Lab Tests',
      description: 'View pending tests',
      href: '/lab/dashboard',
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600'
    }
  ],
  receptionist: [
    {
      title: 'Receptionist Dashboard',
      description: 'Manage appointments and patients',
      href: '/receptionist/dashboard',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Receptionist Overview',
      description: 'Quick access and statistics',
      href: '/receptionist',
      icon: LayoutDashboard,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Book Appointment',
      description: 'Schedule new patient visit',
      href: '/book',
      icon: Calendar,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Print Queue',
      description: 'Print patient slips',
      href: '/receptionist/dashboard',
      icon: Printer,
      color: 'from-orange-500 to-orange-600'
    }
  ]
}

export default function HubPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const userRole = session?.user?.role
    ? String(session.user.role).toLowerCase().replace(/\s+/g, '_')
    : null

  const staffLinks = userRole ? roleLinks[userRole] || [] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Navigation Hub
          </h1>
          <p className="text-xl text-slate-400">
            {session
              ? `Welcome back, ${session.user?.name || 'User'} (${session.user?.role})`
              : 'Quick access to all system features'}
          </p>
        </div>

        {/* Role-specific section */}
        {session && staffLinks.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Your Dashboards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffLinks.map((link, index) => (
                <NavCard key={index} {...link} />
              ))}
            </div>
          </div>
        )}

        {/* Public/Common section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-400" />
            {session ? 'Common Features' : 'Get Started'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicLinks.map((link, index) => (
              <NavCard key={index} {...link} />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {!session && (
          <div className="mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Need Help?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              If you're a staff member, please use the Staff Login to access your dashboard.
              For patients, you can book appointments or check queue status without logging in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Staff Login
              </button>
              <button
                onClick={() => router.push('/book')}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface NavCardProps {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: string
}

function NavCard({ title, description, href, icon: Icon, color }: NavCardProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(href)}
      className={`group relative bg-gradient-to-br ${color} text-white rounded-2xl p-6 transition-all transform hover:scale-105 shadow-lg text-left overflow-hidden`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-7 h-7" />
          </div>
          <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </button>
  )
}
