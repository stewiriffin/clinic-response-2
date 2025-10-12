'use client'

import React, { useState } from 'react'

export default function BookingForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const bookAppointment = async () => {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Jane Doe',
          phone: '0712345678',
          reason: 'Consultation',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || data?.errors?.[0]?.message || 'Unknown error')
        setLoading(false)
        return
      }

      setSuccessMsg(
        data?.data?.queueNumber
          ? `Booking successful! Queue Number: ${data.data.queueNumber}`
          : 'Booking successful!'
      )
    } catch (err) {
      setError('Booking failed, please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={bookAppointment} disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
    </div>
  )
}
