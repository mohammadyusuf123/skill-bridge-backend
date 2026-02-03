import { z } from 'zod'

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  role: z
    .enum(['STUDENT', 'TUTOR'])
    .default('STUDENT'),
})

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  phone: z
    .string()
    .optional(),
  image: z
    .string()
    .url('Invalid image URL')
    .optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
