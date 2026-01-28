import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../../lib/middleware/authMiddleware';
import { validate } from '../../../lib/middleware/validation';
import  BookingController  from '../booking/booking.controller';

const router = Router();

// Validation rules
const createBookingValidation = [
  body('tutorId').notEmpty().withMessage('Tutor ID is required'),
  body('subject').notEmpty().withMessage('Subject is required').trim(),
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:mm)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:mm)'),
  body('studentNotes').optional().isString().trim(),
];

const updateBookingValidation = [
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).withMessage('Invalid status'),
  body('tutorNotes').optional().isString().trim(),
  body('cancelReason').optional().isString().trim(),
];

const cancelBookingValidation = [
  body('reason').optional().isString().trim(),
];

// Protected routes
router.post('/', authenticate, validate(createBookingValidation), BookingController.createBooking);
router.get('/my-bookings', authenticate, BookingController.getUserBookings);
router.get('/stats', authenticate, BookingController.getBookingStats);
router.get('/:bookingId', authenticate, BookingController.getBookingById);
router.put('/:bookingId', authenticate, validate(updateBookingValidation), BookingController.updateBooking);
router.post('/:bookingId/cancel', authenticate, validate(cancelBookingValidation), BookingController.cancelBooking);
router.post('/:bookingId/complete', authenticate, BookingController.markAsComplete);

export const BookingRoutes = router;