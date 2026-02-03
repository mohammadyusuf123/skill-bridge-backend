'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useGetOwnTutorProfile } from '@/lib/hooks/use-tutors'
import { useGetAvailability, useCreateAvailability, useDeleteAvailability } from '@/lib/hooks/use-availability'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { availabilitySchema } from '@/lib/validations/tutor'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addNotification } from '@/lib/redux/slices/ui-slice'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function AvailabilityPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tutorProfile, isLoading: profileLoading } = useGetOwnTutorProfile()
  const { data: availability = [] } = useGetAvailability(tutorProfile?.id || '')
  const createAvailability = useCreateAvailability()
  const deleteAvailability = useDeleteAvailability('')

  const form = useForm({
    defaultValues: {
      dayOfWeek: 'MONDAY' as const,
      startTime: '09:00',
      endTime: '17:00',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await createAvailability.mutateAsync(value)
        dispatch(
          addNotification({
            type: 'success',
            message: 'Availability added successfully',
          })
        )
        form.reset()
      } catch (error: any) {
        dispatch(
          addNotification({
            type: 'error',
            message: error.message || 'Failed to add availability',
          })
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  if (user?.role !== 'TUTOR' || !tutorProfile) {
    return <div className="text-center py-12">You must be a tutor to access this page</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Set Your Availability</h1>
        <p className="text-muted mt-2">Let students know when you're available for sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="card space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">Add Time Slot</h3>

          <form.Field name="dayOfWeek">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Day of Week
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="input-field"
                  disabled={isSubmitting}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-2">
            <form.Field
              name="startTime"
              validators={availabilitySchema.shape.startTime}
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
              validators={availabilitySchema.shape.endTime}
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

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Time Slot'}
          </button>
        </form>

        <div className="card space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Your Schedule</h3>
          {availability && availability.length > 0 ? (
            <div className="space-y-2">
              {availability.map((slot: any) => (
                <div key={slot.id} className="flex items-center justify-between bg-input p-3 rounded">
                  <div>
                    <p className="font-medium text-foreground">
                      {slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()}
                    </p>
                    <p className="text-sm text-muted">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await deleteAvailability.mutateAsync()
                        dispatch(
                          addNotification({
                            type: 'success',
                            message: 'Time slot deleted',
                          })
                        )
                      } catch (error: any) {
                        dispatch(
                          addNotification({
                            type: 'error',
                            message: error.message || 'Failed to delete slot',
                          })
                        )
                      }
                    }}
                    className="text-destructive hover:bg-destructive hover:text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No time slots added yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
