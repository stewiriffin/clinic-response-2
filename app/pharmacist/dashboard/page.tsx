'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import {
  Download, FileText, Pill, Clock, CheckCircle, LogOut, Menu, X,
  Search, Filter, AlertCircle, Printer, TrendingUp, Package,
  ChevronDown, Bell, Settings
} from 'lucide-react'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

interface Prescription {
  _id: string
  patient?: {
    fullName: string
    phone: string
    doctorType: string
    email?: string
  }
  prescription?: string
  status: string
  dispensed?: boolean
  pharmacistNote?: string
  createdAt?: string
  dispensedAt?: string
}

export default function PharmacistDashboard() {
  const { status } = useSession()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'dispensed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      // Request only 50 appointments at a time for faster load
      const res = await fetch('/api/appointment?limit=50&page=1')
      const result = await res.json()
      // Handle both paginated response and plain array for backwards compatibility
      const data = Array.isArray(result) ? result : (result.data || [])
      setPrescriptions(data.filter((a: any) => a.prescription))
    } catch {
      toast.error('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchPrescriptions()
    }
  }, [status, router])

  // 🔔 Real-time updates: Listen for appointment changes (prescriptions are part of appointments)
  useRealTimeUpdates({
    channel: 'appointments',
    events: {
      'appointment-updated': fetchPrescriptions,
      'new-booking': fetchPrescriptions,
    },
    enabled: status === 'authenticated',
  })

  const handleDispense = async (id: string) => {
    const note = noteInput[id]?.trim() || ''
    if (!note) {
      toast.error('Please add notes before dispensing')
      return
    }

    try {
      const res = await fetch(`/api/appointment/${id}/dispense`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispensed: true, pharmacistNote: note, dispensedAt: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error()
      toast.success('Prescription dispensed successfully')
      setNoteInput(prev => ({ ...prev, [id]: '' }))
      setExpandedId(null)
      fetchPrescriptions()
    } catch (error) {
      console.error(error)
      toast.error('Failed to dispense prescription')
    }
  }

  const handlePrint = async (prescription: Prescription) => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      doc.setFillColor(41, 128, 185)
      doc.rect(0, 0, pageWidth, 40, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.text('PHARMACY PRESCRIPTION', pageWidth / 2, 15, { align: 'center' })
      doc.setFontSize(10)
      doc.text('Official Dispensing Document', pageWidth / 2, 28, { align: 'center' })

      doc.setTextColor(0, 0, 0)

      let y = 55

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('PATIENT INFORMATION', 20, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)

      const patientInfo = [
        ['Patient Name:', prescription.patient?.fullName || 'N/A'],
        ['Phone Number:', prescription.patient?.phone || 'N/A'],
        ['Email:', prescription.patient?.email || 'N/A'],
        ['Doctor Specialty:', prescription.patient?.doctorType || 'N/A'],
        ['Appointment Status:', prescription.status]
      ]

      patientInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 25, y)
        doc.setFont('helvetica', 'normal')
        doc.text(String(value), 70, y)
        y += 8
      })

      y += 5

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('PRESCRIPTION DETAILS', 20, y)
      y += 8

      doc.setFillColor(240, 240, 240)
      doc.rect(20, y - 3, pageWidth - 40, pageHeight - y - 100, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const prescriptionText = prescription.prescription || 'No prescription details'
      const lines = doc.splitTextToSize(prescriptionText, pageWidth - 50)
      doc.text(lines, 25, y + 5)

      y += lines.length * 7 + 15

      if (prescription.pharmacistNote) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('PHARMACIST NOTES', 20, y)
        y += 8

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        const noteLines = doc.splitTextToSize(prescription.pharmacistNote, pageWidth - 40)
        doc.text(noteLines, 25, y)
        y += noteLines.length * 6 + 8
      }

      doc.setFillColor(prescription.dispensed ? 46 : 230, prescription.dispensed ? 185 : 126, prescription.dispensed ? 89 : 34)
      doc.rect(20, pageHeight - 40, pageWidth - 40, 35, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(`STATUS: ${prescription.dispensed ? 'DISPENSED' : 'PENDING'}`, pageWidth / 2, pageHeight - 20, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

      const pdfBlob = doc.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => printWindow.print()
      }
    } catch {
      toast.error('Failed to generate PDF')
    }
  }

  const handleDownloadAll = async () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let pageNum = 1
      let y = 30

      doc.setFillColor(41, 128, 185)
      doc.rect(0, 0, pageWidth, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.text('PHARMACY PRESCRIPTIONS REPORT', pageWidth / 2, 16, { align: 'center' })

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()} | Total: ${prescriptions.length}`, 20, y)
      y += 15

      prescriptions.forEach((prescription, index) => {
        if (y > 250) {
          doc.addPage()
          y = 20
          doc.setFontSize(9)
          doc.text(`Page ${++pageNum}`, pageWidth - 30, 10)
        }

        doc.setFillColor(230, 240, 250)
        doc.rect(15, y - 5, pageWidth - 30, 35, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(`${index + 1}. ${prescription.patient?.fullName}`, 20, y)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`Phone: ${prescription.patient?.phone} | Doctor: ${prescription.patient?.doctorType}`, 20, y + 7)
        doc.text(`Status: ${prescription.status} | Dispensed: ${prescription.dispensed ? 'Yes' : 'No'}`, 20, y + 13)
        doc.text(`Rx: ${prescription.prescription?.substring(0, 60)}${prescription.prescription && prescription.prescription.length > 60 ? '...' : ''}`, 20, y + 20)

        y += 40
      })

      doc.save('Prescriptions_Report.pdf')
      toast.success('Downloaded prescriptions report')
    } catch {
      toast.error('Failed to download report')
    }
  }

  const filtered = useMemo(() => {
    let result = prescriptions.filter(p => {
      if (filter === 'pending' && p.dispensed) return false
      if (filter === 'dispensed' && !p.dispensed) return false
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        return (
          p.patient?.fullName?.toLowerCase().includes(search) ||
          p.patient?.doctorType?.toLowerCase().includes(search) ||
          p.patient?.phone?.includes(search)
        )
      }
      return true
    })

    return result.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.patient?.fullName || '').localeCompare(b.patient?.fullName || '')
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })
  }, [prescriptions, filter, searchQuery, sortBy])

  const stats = useMemo(() => ({
    total: prescriptions.length,
    pending: prescriptions.filter(p => !p.dispensed).length,
    dispensed: prescriptions.filter(p => p.dispensed).length,
    percentComplete: prescriptions.length > 0 ? Math.round((prescriptions.filter(p => p.dispensed).length / prescriptions.length) * 100) : 0
  }), [prescriptions])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 animate-pulse">
            <Pill className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-xl font-semibold text-white">Loading Pharmacy Dashboard</p>
          <p className="text-slate-400 text-sm mt-2">Fetching prescriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-x-hidden">
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all ${sidebarOpen ? 'bg-black/50' : 'pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`fixed left-0 top-0 w-64 h-screen bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col transition-all z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <Pill className="w-7 h-7 text-blue-400" />
            Pharmacy Station
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-slate-300 mb-1">Prescriptions</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-2">
              <span className="text-blue-300 font-medium">{stats.percentComplete}%</span> complete
            </p>
            <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
                style={{ width: `${stats.percentComplete}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Pending" value={stats.pending} color="yellow" />
            <StatCard label="Done" value={stats.dispensed} color="green" />
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 transition-all text-sm">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg font-medium transition-all border border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <div className="lg:ml-64">
        <div className="sticky top-0 z-50 bg-slate-800/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">Pharmacy</h2>
                <p className="text-sm text-slate-400">Prescription Management System</p>
              </div>
            </div>
            <span className="text-sm text-slate-400 whitespace-nowrap">
              {filtered.length} of {prescriptions.length}
            </span>
          </div>
        </div>

        <div className="w-full p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStat
              label="Total Prescriptions"
              value={stats.total}
              icon={<Package className="w-5 h-5" />}
              color="blue"
            />
            <QuickStat
              label="Pending Dispensing"
              value={stats.pending}
              icon={<Clock className="w-5 h-5" />}
              color="yellow"
            />
            <QuickStat
              label="Dispensed"
              value={stats.dispensed}
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
            />
            <QuickStat
              label="Completion Rate"
              value={`${stats.percentComplete}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
            />
          </div>

          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Filters and Search</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, doctor, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="all" className="bg-slate-800">All Prescriptions</option>
                <option value="pending" className="bg-slate-800">Pending Only</option>
                <option value="dispensed" className="bg-slate-800">Dispensed Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="date" className="bg-slate-800">Newest First</option>
                <option value="name" className="bg-slate-800">By Patient Name</option>
              </select>

              <button
                onClick={handleDownloadAll}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl">
                <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium text-lg">No prescriptions found</p>
                <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              filtered.map((prescription, index) => {
                const isExpanded = expandedId === prescription._id
                const isPending = !prescription.dispensed

                return (
                  <div
                    key={prescription._id}
                    className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group"
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : prescription._id)}
                      className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-bold text-sm">
                              {index + 1}
                            </div>
                            <h4 className="text-lg font-semibold text-white">
                              {prescription.patient?.fullName || 'Unknown Patient'}
                            </h4>
                            <div className={`w-2 h-2 rounded-full ${
                              isPending ? 'bg-yellow-400' : 'bg-green-400'
                            }`} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Pill className="w-4 h-4 text-blue-400" />
                              {prescription.patient?.doctorType}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-blue-400" />
                              {prescription.status}
                            </span>
                            {prescription.createdAt && (
                              <span className="text-slate-500">
                                {new Date(prescription.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                            isPending
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {isPending ? (
                              <>
                                <Clock className="w-4 h-4" />
                                Pending
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Dispensed
                              </>
                            )}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/5 p-6 space-y-6 bg-white/5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Prescription Details
                          </label>
                          <div className="p-4 bg-white/10 border border-white/10 rounded-lg">
                            <p className="text-white whitespace-pre-wrap font-mono text-sm">
                              {prescription.prescription || 'No prescription details'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InfoField label="Patient Name" value={prescription.patient?.fullName} />
                          <InfoField label="Phone Number" value={prescription.patient?.phone} />
                          <InfoField label="Doctor Specialty" value={prescription.patient?.doctorType} />
                          <InfoField label="Status" value={prescription.status} />
                          {prescription.patient?.email && (
                            <InfoField label="Email" value={prescription.patient.email} />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Pharmacist Notes {isPending && <span className="text-red-400">*</span>}
                          </label>
                          {prescription.dispensed && prescription.pharmacistNote ? (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-white">
                              <p className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="font-medium">Dispensed on {prescription.dispensedAt ? new Date(prescription.dispensedAt).toLocaleString() : 'N/A'}</span>
                              </p>
                              {prescription.pharmacistNote}
                            </div>
                          ) : isPending ? (
                            <textarea
                              placeholder="Add pharmacist notes before dispensing..."
                              value={noteInput[prescription._id] || ''}
                              onChange={(e) => setNoteInput(prev => ({ ...prev, [prescription._id]: e.target.value }))}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all resize-none"
                              rows={4}
                            />
                          ) : (
                            <p className="text-slate-400 italic">No notes added</p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-white/5">
                          {isPending && (
                            <button
                              onClick={() => handleDispense(prescription._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Dispense Medicine
                            </button>
                          )}
                          <button
                            onClick={() => handlePrint(prescription)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 rounded-lg font-medium transition-all border border-slate-500/20"
                          >
                            <Printer className="w-4 h-4" />
                            Print Receipt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ label, value }: any) => (
  <div className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
)

const QuickStat = ({ label, value, icon, color }: any) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors] || colors.blue} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80 font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-20">
          {icon}
        </div>
      </div>
    </div>
  )
}

const InfoField = ({ label, value }: any) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-white font-medium">{value || 'N/A'}</p>
  </div>
)
