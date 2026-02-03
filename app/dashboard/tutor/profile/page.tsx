'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useGetOwnTutorProfile, useCreateTutorProfile, useUpdateTutorProfile } from '@/lib/hooks/use-tutors'
import { useGetCategories } from '@/lib/hooks/use-categories'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createTutorProfileSchema } from '@/lib/validations/tutor'
import { useAppDispatch } from '@/lib/redux/hooks'
import { addNotification } from '@/lib/redux/slices/ui-slice'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function TutorProfilePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tutorProfile, isLoading: profileLoading } = useGetOwnTutorProfile()
  const { data: categories } = useGetCategories()
  const createTutorProfile = useCreateTutorProfile()
  const updateTutorProfile = useUpdateTutorProfile()

  const form = useForm({
    defaultValues: {
      title: '',
      headline: '',
      description: '',
      hourlyRate: 50,
      experience: 0,
      education: '',
      categoryIds: [] as string[],
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        if (tutorProfile?.id) {
          await updateTutorProfile.mutateAsync(value)
          dispatch(
            addNotification({
              type: 'success',
              message: 'Profile updated successfully',
            })
          )
        } else {
          await createTutorProfile.mutateAsync(value)
          dispatch(
            addNotification({
              type: 'success',
              message: 'Tutor profile created successfully',
            })
          )
        }
      } catch (error: any) {
        dispatch(
          addNotification({
            type: 'error',
            message: error.message || 'Failed to save profile',
          })
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  useEffect(() => {
    if (tutorProfile) {
      form.setFieldValue('title', tutorProfile.title || '')
      form.setFieldValue('headline', tutorProfile.headline || '')
      form.setFieldValue('description', tutorProfile.description || '')
      form.setFieldValue('hourlyRate', tutorProfile.hourlyRate || 50)
      form.setFieldValue('experience', tutorProfile.experience || 0)
      form.setFieldValue('education', tutorProfile.education || '')
      form.setFieldValue(
        'categoryIds',
        tutorProfile.categories?.map((c) => c.id) || []
      )
    }
  }, [tutorProfile])

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  if (user?.role !== 'TUTOR') {
    return <div className="text-center py-12">You must be a tutor to access this page</div>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {tutorProfile ? 'Edit Tutor Profile' : 'Create Tutor Profile'}
        </h1>
        <p className="text-muted mt-2">Showcase your expertise and attract students</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="card space-y-6"
      >
        <form.Field
          name="title"
          validators={createTutorProfileSchema.shape.title}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Professional Title *
              </label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Advanced Mathematics Tutor"
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
          name="headline"
          validators={createTutorProfileSchema.shape.headline}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Headline
              </label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="A catchy headline for your profile"
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
          name="description"
          validators={createTutorProfileSchema.shape.description}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                About You
              </label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Tell students about your experience, teaching style, and goals..."
                className="input-field resize-none h-32"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form.Field
            name="hourlyRate"
            validators={createTutorProfileSchema.shape.hourlyRate}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Hourly Rate ($) *
                </label>
                <input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  min="5"
                  max="500"
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
            name="experience"
            validators={createTutorProfileSchema.shape.experience}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  min="0"
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
            name="education"
            validators={createTutorProfileSchema.shape.education}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Education
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., B.S. Mathematics"
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
          name="categoryIds"
          validators={createTutorProfileSchema.shape.categoryIds}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Categories *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories?.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.state.value.includes(category.id)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...field.state.value, category.id]
                          : field.state.value.filter((id) => id !== category.id)
                        field.handleChange(newValue)
                      }}
                      disabled={isSubmitting}
                      className="rounded"
                    />
                    <span className="text-foreground">{category.name}</span>
                  </label>
                ))}
              </div>
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
            {isSubmitting
              ? 'Saving...'
              : tutorProfile
                ? 'Update Profile'
                : 'Create Profile'}
          </button>
          <a href="/dashboard" className="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
