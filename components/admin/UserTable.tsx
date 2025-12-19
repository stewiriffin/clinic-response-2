'use client'

import { useState } from 'react'
import { Ban, Shield, Key, Trash2, Check, X, Loader2 } from 'lucide-react'

interface User {
  _id: string
  email: string
  fullName: string
  role: string
  createdAt: string
  isBanned?: boolean
}

interface UserTableProps {
  users: User[]
  onRefresh: () => void
}

export function UserTable({ users, onRefresh }: UserTableProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<{ action: string; userId: string } | null>(null)

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban: !currentlyBanned })
      })

      if (res.ok) {
        onRefresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
      setShowConfirm(null)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/promote`, {
        method: 'POST',
      })

      if (res.ok) {
        onRefresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to promote user')
      }
    } catch (error) {
      console.error('Error promoting user:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
      setShowConfirm(null)
    }
  }

  const handleResetPassword = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Password reset successful!\nTemporary password: ${data.temporaryPassword}\n\nUser will be prompted to change this on next login.`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
      setShowConfirm(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        onRefresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
      setShowConfirm(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: 'bg-red-500/10 text-red-400 border-red-500/20',
      Doctor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Nurse: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      Pharmacist: 'bg-green-500/10 text-green-400 border-green-500/20',
      'Lab technician': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      Receptionist: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }
    return colors[role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full">
          <thead className="border-b border-slate-800 bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user._id} className="bg-slate-950/50 transition-colors hover:bg-slate-900/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{user.fullName}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.isBanned ? (
                    <span className="inline-flex items-center gap-1 text-sm text-red-400">
                      <X className="h-4 w-4" />
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-green-400">
                      <Check className="h-4 w-4" />
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowConfirm({ action: 'ban', userId: user._id })}
                      disabled={loading === user._id}
                      className={`rounded-lg p-2 transition-colors ${
                        user.isBanned
                          ? 'hover:bg-green-500/10 text-green-400'
                          : 'hover:bg-red-500/10 text-red-400'
                      } disabled:opacity-50`}
                      title={user.isBanned ? 'Unban User' : 'Ban User'}
                    >
                      {loading === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </button>

                    {user.role !== 'Admin' && (
                      <button
                        onClick={() => setShowConfirm({ action: 'promote', userId: user._id })}
                        disabled={loading === user._id}
                        className="rounded-lg p-2 text-purple-400 transition-colors hover:bg-purple-500/10 disabled:opacity-50"
                        title="Promote to Admin"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setShowConfirm({ action: 'reset', userId: user._id })}
                      disabled={loading === user._id}
                      className="rounded-lg p-2 text-orange-400 transition-colors hover:bg-orange-500/10 disabled:opacity-50"
                      title="Reset Password"
                    >
                      <Key className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setShowConfirm({ action: 'delete', userId: user._id })}
                      disabled={loading === user._id}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white">Confirm Action</h3>
            <p className="mt-2 text-slate-400">
              {showConfirm.action === 'ban' && 'Are you sure you want to ban/unban this user?'}
              {showConfirm.action === 'promote' && 'Are you sure you want to promote this user to Admin?'}
              {showConfirm.action === 'reset' && 'Are you sure you want to reset this user\'s password?'}
              {showConfirm.action === 'delete' && 'Are you sure you want to delete this user? This action cannot be undone.'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirm.action === 'ban') {
                    const user = users.find(u => u._id === showConfirm.userId)
                    handleBanUser(showConfirm.userId, user?.isBanned || false)
                  } else if (showConfirm.action === 'promote') {
                    handlePromoteToAdmin(showConfirm.userId)
                  } else if (showConfirm.action === 'reset') {
                    handleResetPassword(showConfirm.userId)
                  } else if (showConfirm.action === 'delete') {
                    handleDeleteUser(showConfirm.userId)
                  }
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
