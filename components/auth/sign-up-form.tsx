'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { signUpSchema } from '@/lib/validations/auth'
import { signUp } from '@/lib/auth/auth-client'
import { useAppDispatch } from '@/lib/redux/hooks'
import { setUser } from '@/lib/redux/slices/auth-slice'
import { addNotification } from '@/lib/redux/slices/ui-slice'

export function SignUpForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'STUDENT' as const,
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      try {
        const result = await signUp.email(
          {
            email: value.email,
            password: value.password,
            name: value.name || undefined,
            additionalData: {
              role: value.role,
            },
          },
          {
            onSuccess: (ctx) => {
              if (ctx.user) {
                dispatch(setUser(ctx.user))
                dispatch(
                  addNotification({
                    type: 'success',
                    message: 'Account created successfully',
                  })
                )
                router.push('/dashboard')
              }
            },
            onError: (ctx) => {
              dispatch(
                addNotification({
                  type: 'error',
                  message: ctx.error?.message || 'Failed to create account',
                })
              )
            },
          }
        )
      } catch (error: any) {
        console.error('[v0] Sign up error:', error)
        dispatch(
          addNotification({
            type: 'error',
            message: error.message || 'An error occurred during sign up',
          })
        )
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="bg-background border border-border rounded-lg p-6 space-y-4"
    >
      <form.Field
        name="name"
        validators={signUpSchema.shape.name}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Your name"
              className="input-field"
              disabled={isLoading}
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
        name="email"
        validators={signUpSchema.shape.email}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              disabled={isLoading}
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
        name="password"
        validators={signUpSchema.shape.password}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-destructive text-sm mt-1">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="role">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              I am a
            </label>
            <select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as any)}
              className="input-field"
              disabled={isLoading}
            >
              <option value="STUDENT">Student</option>
              <option value="TUTOR">Tutor</option>
            </select>
          </div>
        )}
      </form.Field>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  )
}
