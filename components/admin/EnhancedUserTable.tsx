'use client'

import { useState } from 'react'
import { Ban, Shield, Key, Trash2, Check, X, Loader2, Edit2, Save, XCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  _id: string
  email: string
  fullName: string
  role: string
  createdAt: string
  isBanned?: boolean
}

interface EnhancedUserTableProps {
  users: User[]
  onRefresh: () => void
}

const roles = ['Admin', 'Doctor', 'Nurse', 'Pharmacist', 'Lab technician', 'Receptionist']

export function EnhancedUserTable({ users, onRefresh }: EnhancedUserTableProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<{ action: string; userId?: string } | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [editingRole, setEditingRole] = useState<{ userId: string; newRole: string } | null>(null)

  // Select/Deselect All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(u => u._id)))
    } else {
      setSelectedUsers(new Set())
    }
  }

  // Toggle individual selection
  const toggleSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  // Inline Role Edit
  const startEditRole = (userId: string, currentRole: string) => {
    setEditingRole({ userId, newRole: currentRole })
  }

  const saveRoleEdit = async (userId: string) => {
    if (!editingRole) return

    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingRole.newRole })
      })

      if (res.ok) {
        toast.success('Role updated successfully')
        setEditingRole(null)
        onRefresh()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const cancelRoleEdit = () => {
    setEditingRole(null)
  }

  // Single User Actions
  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban: !currentlyBanned })
      })

      if (res.ok) {
        toast.success(currentlyBanned ? 'User unbanned' : 'User banned')
        onRefresh()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('An error occurred')
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
        toast.success('User promoted to Admin')
        onRefresh()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to promote user')
      }
    } catch (error) {
      console.error('Error promoting user:', error)
      toast.error('An error occurred')
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
        toast.success(`Password reset! Temp password: ${data.temporaryPassword}`, {
          duration: 10000,
        })
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('An error occurred')
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
        toast.success('User deleted successfully')
        onRefresh()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(null)
      setShowConfirm(null)
    }
  }

  // Bulk Operations
  const handleBulkBan = async () => {
    setBulkLoading(true)
    let successCount = 0
    let errorCount = 0

    for (const userId of selectedUsers) {
      try {
        const res = await fetch(`/api/admin/users/${userId}/ban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ban: true })
        })
        if (res.ok) successCount++
        else errorCount++
      } catch (error) {
        errorCount++
      }
    }

    setBulkLoading(false)
    setSelectedUsers(new Set())
    setShowConfirm(null)

    if (errorCount === 0) {
      toast.success(`${successCount} users banned successfully`)
    } else {
      toast.warning(`${successCount} banned, ${errorCount} failed`)
    }
    onRefresh()
  }

  const handleBulkEmail = async () => {
    const emails = users
      .filter(u => selectedUsers.has(u._id))
      .map(u => u.email)
      .join(',')

    // Open default email client
    window.location.href = `mailto:${emails}?subject=Important%20Notice&body=Hello,`
    setShowConfirm(null)
    toast.success(`Email client opened for ${selectedUsers.size} users`)
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

  const allSelected = users.length > 0 && selectedUsers.size === users.length
  const someSelected = selectedUsers.size > 0 && selectedUsers.size < users.length

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm font-semibold text-blue-400">
            {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm({ action: 'bulk_ban' })}
              disabled={bulkLoading}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <Ban className="h-4 w-4" />
              Bulk Ban
            </button>
            <button
              onClick={() => setShowConfirm({ action: 'bulk_email' })}
              disabled={bulkLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              Bulk Email
            </button>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full">
          <thead className="border-b border-slate-800 bg-slate-900/50">
            <tr>
              <th className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user._id)}
                    onChange={() => toggleSelect(user._id)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{user.fullName}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingRole?.userId === user._id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editingRole.newRole}
                        onChange={(e) => setEditingRole({ ...editingRole, newRole: e.target.value })}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveRoleEdit(user._id)}
                        disabled={loading === user._id}
                        className="rounded p-1 text-green-400 hover:bg-green-500/10"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelRoleEdit}
                        className="rounded p-1 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                      <button
                        onClick={() => startEditRole(user._id, user.role)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="Edit role"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
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
              {showConfirm.action === 'reset' && "Are you sure you want to reset this user's password?"}
              {showConfirm.action === 'delete' && 'Are you sure you want to delete this user? This action cannot be undone.'}
              {showConfirm.action === 'bulk_ban' && `Are you sure you want to ban ${selectedUsers.size} selected users?`}
              {showConfirm.action === 'bulk_email' && `This will open your email client with ${selectedUsers.size} recipients.`}
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
                  if (showConfirm.action === 'ban' && showConfirm.userId) {
                    const user = users.find(u => u._id === showConfirm.userId)
                    handleBanUser(showConfirm.userId, user?.isBanned || false)
                  } else if (showConfirm.action === 'promote' && showConfirm.userId) {
                    handlePromoteToAdmin(showConfirm.userId)
                  } else if (showConfirm.action === 'reset' && showConfirm.userId) {
                    handleResetPassword(showConfirm.userId)
                  } else if (showConfirm.action === 'delete' && showConfirm.userId) {
                    handleDeleteUser(showConfirm.userId)
                  } else if (showConfirm.action === 'bulk_ban') {
                    handleBulkBan()
                  } else if (showConfirm.action === 'bulk_email') {
                    handleBulkEmail()
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
