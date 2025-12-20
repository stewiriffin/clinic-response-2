import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher-client'

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
  useEffect(() => {
    if (!enabled) return

    // Subscribe to channel
    const pusherChannel = pusherClient.subscribe(channel)

    // Bind all events
    Object.entries(events).forEach(([eventName, handler]) => {
      pusherChannel.bind(eventName, handler)
    })

    // Cleanup: unbind events and unsubscribe
    return () => {
      Object.keys(events).forEach((eventName) => {
        pusherChannel.unbind(eventName)
      })
      pusherClient.unsubscribe(channel)
    }
  }, [channel, enabled, events])
}
