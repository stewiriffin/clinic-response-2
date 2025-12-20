import { useState, useEffect, useCallback } from 'react'
import { useRealTimeUpdates } from './useRealTimeUpdates'

interface UseFetchWithRealTimeOptions<T> {
  url: string
  channel: string
  events: string[]
  enabled?: boolean
}

/**
 * Custom hook that fetches data and auto-refreshes on real-time events
 *
 * @example
 * const { data, loading, error, refetch } = useFetchWithRealTime({
 *   url: '/api/admin/users',
 *   channel: 'users',
 *   events: ['user-created', 'user-updated', 'user-deleted']
 * })
 */
export function useFetchWithRealTime<T>({
  url,
  channel,
  events,
  enabled = true
}: UseFetchWithRealTimeOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [url, enabled])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up real-time event handlers
  const eventHandlers = events.reduce((acc, event) => {
    acc[event] = () => {
      console.log(`[Real-time] ${event} received, refreshing data...`)
      fetchData()
    }
    return acc
  }, {} as Record<string, () => void>)

  // Subscribe to real-time updates
  useRealTimeUpdates({
    channel,
    events: eventHandlers,
    enabled
  })

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
