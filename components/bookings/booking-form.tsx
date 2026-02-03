'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createBookingSchema } from '@/lib/validations/booking'
import { useCreateBooking } from '@/lib/hooks/use-bookings'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addNotification } from '@/lib/redux/slices/ui-slice'

interface BookingFormProps {
  tutorId: string
  tutorRate: number
}

export function BookingForm({ tutorId, tutorRate }: BookingFormProps) {
  const dispatch = useAppDispatch()
  const createBooking = useCreateBooking()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      tutorId,
      subject: '',
      sessionDate: '',
      startTime: '09:00',
      endTime: '10:00',
      studentNotes: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await createBooking.mutateAsync(value)
        dispatch(
          addNotification({
            type: 'success',
            message: 'Booking created successfully',
          })
        )
        form.reset()
      } catch (error: any) {
        dispatch(
          addNotification({
            type: 'error',
            message: error.message || 'Failed to create booking',
          })
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const startTime = form.getFieldValue('startTime')
  const endTime = form.getFieldValue('endTime')
  let duration = 0

  if (startTime && endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startTotal = startHour * 60 + startMin
    const endTotal = endHour * 60 + endMin
    duration = Math.max(0, (endTotal - startTotal) / 60)
  }

  const estimatedCost = duration * tutorRate

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="card space-y-4 sticky top-24"
    >
      <h3 className="text-lg font-semibold text-foreground">Book a Session</h3>

      <form.Field
        name="subject"
        validators={createBookingSchema.shape.subject}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Subject
            </label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Mathematics, Biology"
              className="input-field"
              disabled={isSubmitting}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-destructive text-sm mt-1">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="sessionDate"
        validators={createBookingSchema.shape.sessionDate}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="input-field"
              disabled={isSubmitting}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-destructive text-sm mt-1">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-2">
        <form.Field
          name="startTime"
          validators={createBookingSchema.shape.startTime}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input-field"
                disabled={isSubmitting}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-sm mt-1">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="endTime"
          validators={createBookingSchema.shape.endTime}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                End Time
              </label>
              <input
                type="time"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input-field"
                disabled={isSubmitting}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-sm mt-1">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field
        name="studentNotes"
        validators={createBookingSchema.shape.studentNotes}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Any specific topics or questions..."
              className="input-field resize-none h-20"
              disabled={isSubmitting}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-destructive text-sm mt-1">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted">Duration</span>
          <span className="font-semibold text-foreground">{duration.toFixed(1)} hours</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted">Rate</span>
          <span className="font-semibold text-foreground">${tutorRate}/hr</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="font-semibold text-foreground">Estimated Total</span>
          <span className="text-lg font-bold text-primary">${estimatedCost.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? 'Booking...' : 'Book Session'}
      </button>
    </form>
  )
}
