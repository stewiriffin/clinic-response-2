/**
 * Offline Sync Utilities for Nurse Dashboard
 * Stores vitals data locally when offline and syncs when connection returns
 */

interface VitalsData {
  appointmentId: string
  temperature: string
  bloodPressure: string
  pulse: string
  oxygen: string
  weight: string
  height: string
  nurseNote: string
  triageRiskLevel: string
  timestamp: number
}

interface SyncQueueItem {
  id: string
  endpoint: string
  method: 'POST' | 'PATCH'
  data: any
  timestamp: number
  retries: number
}

const STORAGE_KEY = 'nurse_vitals_offline_queue'
const MAX_RETRIES = 3

export class OfflineSync {
  private syncQueue: SyncQueueItem[] = []
  private isSyncing = false

  constructor() {
    this.loadQueue()
    this.setupOnlineListener()
  }

  /**
   * Load pending sync queue from localStorage
   */
  private loadQueue() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }

  /**
   * Save sync queue to localStorage
   */
  private saveQueue() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  /**
   * Setup listener for when connection returns
   */
  private setupOnlineListener() {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      console.log('Connection restored - starting sync')
      this.syncAll()
    })
  }

  /**
   * Check if browser is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  /**
   * Add vitals data to sync queue
   */
  async saveVitalsOffline(appointmentId: string, vitalsData: any): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `vitals_${appointmentId}_${Date.now()}`,
      endpoint: `/api/nurse/${appointmentId}`,
      method: 'PATCH',
      data: vitalsData,
      timestamp: Date.now(),
      retries: 0
    }

    this.syncQueue.push(queueItem)
    this.saveQueue()

    console.log('Vitals saved offline - will sync when connection returns')
  }

  /**
   * Try to sync a single item
   */
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data)
      })

      if (response.ok) {
        console.log(`Successfully synced item: ${item.id}`)
        return true
      }

      if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        console.error(`Client error syncing ${item.id}:`, response.status)
        return true // Remove from queue
      }

      return false // Server error - retry
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error)
      return false
    }
  }

  /**
   * Sync all pending items
   */
  async syncAll(): Promise<void> {
    if (this.isSyncing || !this.isOnline()) {
      return
    }

    this.isSyncing = true

    try {
      const results = await Promise.all(
        this.syncQueue.map(async (item) => {
          const success = await this.syncItem(item)

          if (!success && item.retries < MAX_RETRIES) {
            item.retries++
            return item // Keep in queue
          }

          return null // Remove from queue
        })
      )

      // Filter out successfully synced items
      this.syncQueue = results.filter(item => item !== null) as SyncQueueItem[]
      this.saveQueue()

      console.log(`Sync complete. ${this.syncQueue.length} items remaining`)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Get pending items count
   */
  getPendingCount(): number {
    return this.syncQueue.length
  }

  /**
   * Clear all pending items (use with caution)
   */
  clearQueue(): void {
    this.syncQueue = []
    this.saveQueue()
  }

  /**
   * Get offline status message
   */
  getStatusMessage(): string {
    const count = this.getPendingCount()

    if (!this.isOnline()) {
      return count > 0
        ? `⚠️ Offline - ${count} item${count !== 1 ? 's' : ''} pending sync`
        : '⚠️ Offline Mode'
    }

    if (this.isSyncing) {
      return '🔄 Syncing...'
    }

    return count > 0
      ? `📡 ${count} item${count !== 1 ? 's' : ''} pending sync`
      : '✅ All synced'
  }
}

// Singleton instance
let offlineSyncInstance: OfflineSync | null = null

export function getOfflineSync(): OfflineSync {
  if (typeof window === 'undefined') {
    // Return mock for SSR
    return {
      isOnline: () => true,
      saveVitalsOffline: async () => {},
      syncAll: async () => {},
      getPendingCount: () => 0,
      clearQueue: () => {},
      getStatusMessage: () => ''
    } as OfflineSync
  }

  if (!offlineSyncInstance) {
    offlineSyncInstance = new OfflineSync()
  }

  return offlineSyncInstance
}
