'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Upload, Plus, Search, Filter, Clock, CheckCircle,
  Download, Trash2, Eye, LogOut, Menu, X, AlertCircle, Beaker
} from 'lucide-react'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

interface LabTest {
  _id?: string
  patientName: string
  testType: string
  result?: string
  status: 'pending' | 'completed'
  fileUrl?: string
  createdAt?: string
}

const testTypes = [
  'Blood Test',
  'Urinalysis',
  'X-Ray',
  'CT Scan',
  'MRI',
  'ECG',
  'Ultrasound',
  'Biopsy',
  'Pathology',
]

export default function LabDashboard() {
  const { status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<LabTest[]>([])
  const [form, setForm] = useState<Partial<LabTest>>({
    patientName: '',
    testType: '',
    result: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editResult, setEditResult] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchTests()
    }
  }, [status, router])

  // 🔔 Real-time updates: Listen for lab test changes
  useRealTimeUpdates({
    channel: 'lab-tests',
    events: {
      'lab-test-created': fetchTests,
      'lab-test-updated': fetchTests,
      'lab-test-deleted': fetchTests,
    },
    enabled: status === 'authenticated',
  })

  const fetchTests = async () => {
    try {
      setLoading(true)
      // Request limited data for faster load
      const res = await fetch('/api/labtests')
      const result = await res.json()
      // Take only the first 50 tests for faster rendering
      const data = Array.isArray(result) ? result.slice(0, 50) : (result.data?.slice(0, 50) || [])
      setTests(data)
    } catch {
      toast.error('Failed to load lab tests')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.patientName?.trim() || !form.testType) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const body = new FormData()
      body.append('patientName', form.patientName)
      body.append('testType', form.testType)
      if (file) body.append('file', file)

      const res = await fetch('/api/labtests', {
        method: 'POST',
        body,
      })

      if (!res.ok) throw new Error()

      setForm({ patientName: '', testType: '', result: '' })
      setFile(null)
      toast.success('Lab test created successfully')
      fetchTests()
    } catch {
      toast.error('Failed to create lab test')
    }
  }

  const updateResult = async (id: string, result: string) => {
    if (!result.trim()) {
      toast.error('Result cannot be empty')
      return
    }

    try {
      const res = await fetch(`/api/labtests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, status: 'completed' }),
      })

      if (!res.ok) throw new Error()

      toast.success('Result updated and doctor notified')
      setEditingId(null)
      setEditResult('')
      fetchTests()
    } catch {
      toast.error('Failed to update result')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/labtests/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()

      toast.success('Lab test deleted')
      setDeleteConfirm(null)
      fetchTests()
    } catch {
      toast.error('Failed to delete lab test')
    }
  }

  const filteredTests = useMemo(() => {
    let result = filter === 'all' ? tests : tests.filter(t => t.status === filter)

    if (searchQuery) {
      result = result.filter(t =>
        t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.testType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
  }, [tests, filter, searchQuery])

  const stats = useMemo(() => ({
    total: tests.length,
    pending: tests.filter(t => t.status === 'pending').length,
    completed: tests.filter(t => t.status === 'completed').length,
  }), [tests])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 animate-pulse">
            <Beaker className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-xl font-semibold text-white">Loading Lab Dashboard</p>
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
            <Beaker className="w-7 h-7 text-blue-400" />
            Lab Workspace
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-slate-300">Lab Statistics</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Total Tests</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Pending" value={stats.pending} color="yellow" />
            <StatCard label="Completed" value={stats.completed} color="green" />
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white">Lab Tests</h2>
            </div>
            <span className="text-sm text-slate-400">
              {filteredTests.length} of {tests.length}
            </span>
          </div>
        </div>

        <div className="w-full p-6 space-y-6">
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Create New Lab Test</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  value={form.patientName || ''}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Test Type
                </label>
                <select
                  value={form.testType || ''}
                  onChange={(e) => setForm({ ...form, testType: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all"
                >
                  <option value="" className="bg-slate-800">Select test type</option>
                  {testTypes.map(type => (
                    <option key={type} value={type} className="bg-slate-800">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Upload File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {file ? file.name.substring(0, 15) + '...' : 'Choose file'}
                  </label>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleCreate}
                  className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Test
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient or test type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all"
                />
              </div>

              <div className="flex gap-2">
                {(['all', 'pending', 'completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2 text-sm">
              <span className="text-slate-400">Showing</span>
              <span className="text-white font-semibold">{filteredTests.length}</span>
              <span className="text-slate-400">of</span>
              <span className="text-white font-semibold">{tests.length}</span>
              <span className="text-slate-400">tests</span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTests.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">No lab tests found</p>
                <p className="text-slate-500 text-sm mt-1">Create a new test or adjust your filters</p>
              </div>
            ) : (
              filteredTests.map(test => {
                const isPending = test.status === 'pending'

                return (
                  <div
                    key={test._id}
                    className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${
                            test.status === 'pending' ? 'bg-yellow-400' : 'bg-green-400'
                          }`} />
                          <h4 className="text-lg font-semibold text-white">
                            {test.patientName}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                            test.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {test.status === 'pending' ? (
                              <>
                                <Clock className="w-4 h-4" />
                                Pending
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Completed
                              </>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-slate-400 text-sm">
                          <span className="flex items-center gap-1">
                            <Beaker className="w-4 h-4" />
                            {test.testType}
                          </span>
                          {test.createdAt && (
                            <span>
                              {new Date(test.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {test.fileUrl && (
                        <a
                          href={test.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          View File
                        </a>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Test Result
                      </label>
                      {editingId === test._id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editResult}
                            onChange={(e) => setEditResult(e.target.value)}
                            placeholder="Enter test results..."
                            rows={3}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateResult(test._id!, editResult)}
                              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                            >
                              Save Result
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditResult('')
                              }}
                              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg font-medium transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <p className={`flex-1 px-4 py-2 rounded-lg ${
                            test.result
                              ? 'bg-white/5 text-white'
                              : 'bg-white/5 text-slate-500 italic'
                          }`}>
                            {test.result || 'No result yet'}
                          </p>
                          {isPending && (
                            <button
                              onClick={() => {
                                setEditingId(test._id!)
                                setEditResult(test.result || '')
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                            >
                              Enter Result
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 justify-end">
                      {test.fileUrl && (
                        <a
                          href={test.fileUrl}
                          download
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(test._id!)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Delete Lab Test</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this lab test? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
