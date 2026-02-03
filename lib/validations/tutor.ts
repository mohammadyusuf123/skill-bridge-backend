import { z } from 'zod'

export const createTutorProfileSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  headline: z
    .string()
    .max(200, 'Headline must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  hourlyRate: z
    .number()
    .min(5, 'Hourly rate must be at least 5')
    .max(500, 'Hourly rate cannot exceed 500'),
  experience: z
    .number()
    .min(0, 'Experience must be a positive number')
    .optional(),
  education: z
    .string()
    .max(500, 'Education must be less than 500 characters')
    .optional(),
  categoryIds: z
    .array(z.string())
    .min(1, 'At least one category is required'),
})

export const updateTutorProfileSchema = createTutorProfileSchema.partial()

export const availabilitySchema = z.object({
  dayOfWeek: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
})

export type CreateTutorProfileInput = z.infer<typeof createTutorProfileSchema>
export type UpdateTutorProfileInput = z.infer<typeof updateTutorProfileSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
