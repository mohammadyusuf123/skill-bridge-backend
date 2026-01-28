import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../../lib/middleware/validation';
import { authenticate, authorize, UserRole } from '../../../lib/middleware/authMiddleware';
import bookingController from './booking.controller'; // Changed from { BookingController }

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
router.get('/allbookings', authenticate, authorize(UserRole.ADMIN), bookingController.getAllBookings.bind(bookingController));
router.post('/create', authenticate, authorize(UserRole.ADMIN, UserRole.TUTOR), validate(createBookingValidation), bookingController.createBooking.bind(bookingController));
router.get('/my-bookings', authenticate, bookingController.getUserBookings.bind(bookingController));
router.get('/stats', authenticate, bookingController.getBookingStats.bind(bookingController));

// ⚠️ dynamic param routes always last
router.get('/:bookingId', authenticate, bookingController.getBookingById.bind(bookingController));
router.put('/:bookingId', authenticate, validate(updateBookingValidation), bookingController.updateBooking.bind(bookingController));
router.post('/:bookingId/cancel', authenticate, validate(cancelBookingValidation), bookingController.cancelBooking.bind(bookingController));

export const BookingRoutes = router;