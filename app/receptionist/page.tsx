'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import {
  Users, Calendar, Clock, CheckCircle, ArrowRight,
  Activity, FileText, Printer, Plus, Search
} from 'lucide-react'

interface Stats {
  todayAppointments: number
  waitingPatients: number
  completedToday: number
  totalPatients: number
}

export default function ReceptionistOverview() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    todayAppointments: 0,
    waitingPatients: 0,
    completedToday: 0,
    totalPatients: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (
      status === 'authenticated' &&
      session?.user?.role?.toLowerCase() !== 'receptionist'
    ) {
      router.push('/login')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/appointment')
        const appointments = await res.json()

        const today = new Date().toDateString()
        const todayAppts = appointments.filter(
          (a: any) => new Date(a.createdAt).toDateString() === today
        )

        setStats({
          todayAppointments: todayAppts.length,
          waitingPatients: appointments.filter((a: any) => a.status === 'waiting').length,
          completedToday: todayAppts.filter((a: any) => a.status === 'done').length,
          totalPatients: appointments.length
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      title="Receptionist Dashboard"
      description={`Welcome back, ${session?.user?.name || 'Receptionist'}`}
      breadcrumbs={[
        { label: 'Receptionist', href: '/receptionist' },
        { label: 'Dashboard', href: '/receptionist' }
      ]}
      stats={[
        {
          label: 'Today\'s Appointments',
          value: stats.todayAppointments,
          icon: Calendar,
          color: 'blue',
          trend: { value: '+12%', isPositive: true }
        },
        {
          label: 'Waiting Patients',
          value: stats.waitingPatients,
          icon: Clock,
          color: 'yellow'
        },
        {
          label: 'Completed Today',
          value: stats.completedToday,
          icon: CheckCircle,
          color: 'green'
        },
        {
          label: 'Total Patients',
          value: stats.totalPatients,
          icon: Users,
          color: 'purple'
        }
      ]}
      actions={
        <button
          onClick={() => router.push('/book')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </button>
      }
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Book Appointment"
          description="Schedule a new patient visit"
          icon={Calendar}
          color="blue"
          onClick={() => router.push('/book')}
        />
        <ActionCard
          title="View Queue"
          description="Check current patient queue"
          icon={Activity}
          color="purple"
          onClick={() => router.push('/status')}
        />
        <ActionCard
          title="Full Dashboard"
          description="Access detailed dashboard view"
          icon={FileText}
          color="cyan"
          onClick={() => router.push('/receptionist/dashboard')}
        />
        <ActionCard
          title="Search Patient"
          description="Find patient records"
          icon={Search}
          color="green"
          onClick={() => router.push('/patient')}
        />
        <ActionCard
          title="Print Queue"
          description="Print queue slips"
          icon={Printer}
          color="yellow"
          onClick={() => window.print()}
        />
        <ActionCard
          title="Patient Portal"
          description="Access patient management"
          icon={Users}
          color="red"
          onClick={() => router.push('/patient')}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Tips</h3>
        <ul className="space-y-3 text-slate-300">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Book appointments quickly using the "New Appointment" button</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Monitor the queue status in real-time from the View Queue section</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Use the search feature to quickly find patient records</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Print patient slips directly from the dashboard</span>
          </li>
        </ul>
      </div>
    </DashboardLayout>
  )
}

interface ActionCardProps {
  title: string
  description: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'cyan'
  onClick: () => void
}

const colorVariants = {
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
}

function ActionCard({ title, description, icon: Icon, color, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${colorVariants[color]} text-white rounded-2xl p-6 transition-all transform hover:scale-105 shadow-lg text-left`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
    </button>
  )
}
