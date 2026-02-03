'use client'

import Link from 'next/link'
import type { Booking } from '@/types/api'

export function BookingCard({ booking }: { booking: Booking }) {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-success text-white',
    CANCELLED: 'bg-destructive text-white',
    NO_SHOW: 'bg-gray-100 text-gray-800',
  }

  const sessionDate = new Date(booking.sessionDate)
  const isFuture = sessionDate > new Date()

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{booking.subject}</h3>
          <p className="text-sm text-muted">
            {booking.tutor?.user?.name || booking.student?.name || 'Unknown'}
          </p>
        </div>
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status] || statusColors.PENDING}`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Date</span>
          <span className="font-medium text-foreground">
            {sessionDate.toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Time</span>
          <span className="font-medium text-foreground">
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
      </div>

      {booking.studentNotes && (
        <div className="bg-input rounded p-2">
          <p className="text-xs text-muted">Notes</p>
          <p className="text-sm text-foreground line-clamp-2">{booking.studentNotes}</p>
        </div>
      )}

      <Link
        href={`/dashboard/bookings/${booking.id}`}
        className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
      >
        View Details →
      </Link>
    </div>
  )
}
