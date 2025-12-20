import { useEffect, useState } from 'react'

interface UseRealTimeUpdatesOptions {
  channel: string
  events: {
    [eventName: string]: (data: any) => void
  }
  enabled?: boolean
}

/**
 * Custom hook for subscribing to real-time updates via Pusher
 *
 * OPTIMIZED: Defers Pusher connection to improve initial page load performance
 *
 * @example
 * useRealTimeUpdates({
 *   channel: 'users',
 *   events: {
 *     'user-created': handleUserCreated,
 *     'user-updated': handleUserUpdated,
 *     'user-deleted': handleUserDeleted,
 *   }
 * })
 */
export function useRealTimeUpdates({ channel, events, enabled = true }: UseRealTimeUpdatesOptions) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Defer Pusher loading until after initial page load for better performance
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 800) // Wait 800ms after page load before connecting to Pusher

    return () => clearTimeout(timer)
  }, [enabled])

  useEffect(() => {
    if (!isReady || !enabled) return

    let pusherChannel: any

    // Dynamically import Pusher client to reduce initial bundle size
    import('@/lib/pusher-client').then(({ pusherClient }) => {
      // Subscribe to channel
      pusherChannel = pusherClient.subscribe(channel)

      // Bind all events
      Object.entries(events).forEach(([eventName, handler]) => {
        pusherChannel.bind(eventName, handler)
      })
    })

    // Cleanup: unbind events and unsubscribe
    return () => {
      if (pusherChannel) {
        Object.keys(events).forEach((eventName) => {
          pusherChannel.unbind(eventName)
        })
        import('@/lib/pusher-client').then(({ pusherClient }) => {
          pusherClient.unsubscribe(channel)
        })
      }
    }
  }, [channel, isReady, enabled, events])
}
