'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/admin/Sidebar'
import { Toaster } from '@/components/Toaster'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { SystemStatusBanner } from '@/components/admin/SystemStatusBanner'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'Admin') {
      router.push('/') // Redirect non-admins to home
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'Admin') {
    return null // Will redirect in useEffect
  }

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="ml-72 flex flex-1 flex-col">
          {/* System Status Banner */}
          <SystemStatusBanner />

          {/* Admin Header */}
          <AdminHeader />

          {/* Breadcrumb Navigation */}
          <div className="border-b border-slate-800/50 bg-slate-950/50 px-8 py-4">
            <AdminBreadcrumb />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
