'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { signInSchema } from '@/lib/validations/auth'
import { signIn } from '@/lib/auth/auth-client'
import { useAppDispatch } from '@/lib/redux/hooks'
import { setUser } from '@/lib/redux/slices/auth-slice'
import { addNotification } from '@/lib/redux/slices/ui-slice'

export function SignInForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      try {
        const result = await signIn.email(
          {
            email: value.email,
            password: value.password,
          },
          {
            onSuccess: (ctx) => {
              if (ctx.user) {
                dispatch(setUser(ctx.user))
                dispatch(
                  addNotification({
                    type: 'success',
                    message: 'Signed in successfully',
                  })
                )
                router.push('/dashboard')
              }
            },
            onError: (ctx) => {
              dispatch(
                addNotification({
                  type: 'error',
                  message: ctx.error?.message || 'Failed to sign in',
                })
              )
            },
          }
        )
      } catch (error: any) {
        console.error('[v0] Sign in error:', error)
        dispatch(
          addNotification({
            type: 'error',
            message: error.message || 'An error occurred during sign in',
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
        name="email"
        validators={signInSchema.shape.email}
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
        validators={signInSchema.shape.password}
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

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
