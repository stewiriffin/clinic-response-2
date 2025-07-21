'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type User = {
  _id: string
  fullName: string
  email: string
  role: string
}

type Log = {
  actorEmail: string
  action: string
  timestamp: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchName, setSearchName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [logs, setLogs] = useState<Log[]>([])
  const [metrics, setMetrics] = useState({
    users: 0,
    appointments: 0,
    prescriptions: 0,
    todayAppointments: 0,
  })

  const roles = [
    'admin',
    'doctor',
    'nurse',
    'pharmacist',
    'lab technician',
    'receptionist',
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'Admin') {
      alert('Access denied: Admins only')
      signOut({ callbackUrl: '/login' })
    }
  }, [status, session])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = [...users]
    if (searchName)
      filtered = filtered.filter((u) =>
        u.fullName.toLowerCase().includes(searchName.toLowerCase())
      )
    if (searchEmail)
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(searchEmail.toLowerCase())
      )
    if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter)
    setFilteredUsers(filtered)
  }, [searchName, searchEmail, roleFilter, users])

  const updateUserRole = async (id: string, newRole: string) => {
    try {
      await fetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to update role:', err)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' })
      fetchUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  const roleCounts = roles.reduce((acc, role) => {
    acc[role] = users.filter((u) => u.role === role).length
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch('/api/admin/metrics')
      const data = await res.json()
      setMetrics(data)
    }
    fetchMetrics()
  }, [])

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => setLogs(data))
  }, [])

  return (
    <div className='min-h-screen bg-accent text-primary-dark font-sans p-8'>
      <header className='flex justify-between items-center mb-10'>
        <h1 className='text-3xl font-bold text-primary'>Admin Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700'
        >
          Logout
        </button>
      </header>

      <section className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-xl shadow p-4'>
          <p className='font-semibold text-primary-dark'>Users</p>
          <p className='text-lg font-bold'>{metrics.users}</p>
        </div>
        <div className='bg-white rounded-xl shadow p-4'>
          <p className='font-semibold text-primary-dark'>Appointments</p>
          <p className='text-lg font-bold'>{metrics.appointments}</p>
        </div>
        <div className='bg-white rounded-xl shadow p-4'>
          <p className='font-semibold text-primary-dark'>Prescriptions</p>
          <p className='text-lg font-bold'>{metrics.prescriptions}</p>
        </div>
        <div className='bg-white rounded-xl shadow p-4'>
          <p className='font-semibold text-primary-dark'>Today’s Visits</p>
          <p className='text-lg font-bold'>{metrics.todayAppointments}</p>
        </div>
      </section>

      <section className='mb-6 space-y-2'>
        <div className='flex flex-wrap gap-4'>
          <input
            type='text'
            placeholder='Search by name'
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className='px-4 py-2 border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light'
          />
          <input
            type='text'
            placeholder='Search email'
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className='px-4 py-2 border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light'
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className='px-4 py-2 border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light'
          >
            <option value=''>All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <p className='font-medium text-sm mt-2'>
          Total Users: {users.length} |{' '}
          {roles.map((r) => (
            <span key={r}>
              {r[0].toUpperCase() + r.slice(1)}: {roleCounts[r]} |{' '}
            </span>
          ))}
        </p>
      </section>

      <section className='space-y-4'>
        {filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className='bg-white rounded-xl p-4 shadow-md space-y-1'
            >
              <p>
                <strong>Name:</strong> {user.fullName}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <div className='flex items-center gap-2'>
                <label>
                  <strong>Role:</strong>
                </label>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                  className='border px-2 py-1 rounded'
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => deleteUser(user._id)}
                className='bg-red-600 text-white px-4 py-1 mt-2 rounded-xl hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>

      <section className='mt-12'>
        <h2 className='text-xl font-semibold text-primary mb-2'>Audit Logs</h2>
        <ul className='bg-white p-4 rounded-xl shadow space-y-1 text-sm'>
          {logs.map((log, i) => (
            <li key={i}>
              <strong>{log.actorEmail}</strong> - {log.action} on{' '}
              {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
