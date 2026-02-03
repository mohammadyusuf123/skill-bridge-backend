'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useGetMyBookings } from '@/lib/hooks/use-bookings'
import { redirect } from 'next/navigation'
import { BookingCard } from '@/components/bookings/booking-card'
import { useState } from 'react'

export default function BookingsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { data: bookingsData, isLoading: isBookingsLoading } = useGetMyBookings()
  const [filter, setFilter] = useState('ALL')

  if (isLoading || isBookingsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  const bookings = bookingsData?.data || []
  const filteredBookings = filter === 'ALL'
    ? bookings
    : bookings.filter((b: any) => b.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted mt-2">Manage your tutor sessions</p>
      </div>

      <div className="card flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-input text-foreground hover:bg-border'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((booking: any) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-muted">No bookings found</p>
        </div>
      )}
    </div>
  )
}
