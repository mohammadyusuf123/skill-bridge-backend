'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useGetProfile, useUpdateProfile } from '@/lib/hooks/use-users'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { updateProfileSchema } from '@/lib/validations/auth'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addNotification } from '@/lib/redux/slices/ui-slice'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const dispatch = useAppDispatch()
  const { data: profile, isLoading: profileLoading } = useGetProfile()
  const updateProfile = useUpdateProfile()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      image: profile?.image || '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await updateProfile.mutateAsync(value)
        dispatch(
          addNotification({
            type: 'success',
            message: 'Profile updated successfully',
          })
        )
      } catch (error: any) {
        dispatch(
          addNotification({
            type: 'error',
            message: error.message || 'Failed to update profile',
          })
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  useEffect(() => {
    if (profile) {
      form.setFieldValue('name', profile.name || '')
      form.setFieldValue('phone', profile.phone || '')
      form.setFieldValue('image', profile.image || '')
    }
  }, [profile])

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
        <p className="text-muted mt-2">Update your personal information</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="card space-y-4"
      >
        <div className="border-b border-border pb-4">
          <p className="text-sm text-muted">Email</p>
          <p className="text-lg font-medium text-foreground">{profile?.email}</p>
        </div>

        <form.Field name="name" validators={updateProfileSchema.shape.name}>
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Your full name"
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

        <form.Field name="phone" validators={updateProfileSchema.shape.phone}>
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+1 (555) 123-4567"
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

        <form.Field name="image" validators={updateProfileSchema.shape.image}>
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Profile Image URL
              </label>
              <input
                type="url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
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

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <a href="/dashboard" className="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
