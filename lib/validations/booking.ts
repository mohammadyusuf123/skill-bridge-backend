import { z } from 'zod'

export const createBookingSchema = z.object({
  tutorId: z
    .string()
    .min(1, 'Tutor ID is required'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  sessionDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  studentNotes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
})

export const updateBookingSchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .optional(),
  tutorNotes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  cancelReason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
})

export const cancelBookingSchema = z.object({
  reason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
