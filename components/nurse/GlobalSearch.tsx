'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Phone, User, Hash, ArrowRight } from 'lucide-react'

interface SearchResult {
  _id: string
  type: 'patient' | 'appointment'
  fullName: string
  phone: string
  queueNumber?: number
  status?: string
  reason?: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelectPatient: (appointment: any) => void
}

export default function GlobalSearch({ isOpen, onClose, onSelectPatient }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchPatients = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchPatients, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSelect = (result: SearchResult) => {
    onSelectPatient(result)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        {/* Search Modal */}
        <div
          className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search patients by name, phone, or queue number..."
                className="w-full pl-12 pr-12 py-4 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-lg"
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded">↑↓</kbd>
              <span>Navigate</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded">Enter</kbd>
              <span>Select</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded">Esc</kbd>
              <span>Close</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-8 text-center text-slate-400">
                <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-2">Searching...</p>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <p>No patients found for "{query}"</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="divide-y divide-slate-700">
                {results.map((result, index) => (
                  <button
                    key={result._id}
                    onClick={() => handleSelect(result)}
                    className={`w-full p-4 text-left transition-all ${
                      index === selectedIndex
                        ? 'bg-blue-600/20 border-l-4 border-blue-500'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{result.fullName}</p>
                            <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {result.phone}
                              </span>
                              {result.queueNumber && (
                                <span className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  Queue #{result.queueNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {result.reason && (
                          <p className="text-sm text-slate-400 ml-13">
                            {result.reason}
                          </p>
                        )}

                        {result.status && (
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                            result.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-300' :
                            result.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {result.status}
                          </span>
                        )}
                      </div>

                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
