import { Router } from 'express';
import { body } from 'express-validator';
import  AvailabilityController  from './availability.controller';
import { authenticate, isTutor } from '../../../lib/middleware/authMiddleware';
import { validate } from '../../../lib/middleware/validation';

const router = Router();

// Validation rules
const addAvailabilityValidation = [
  body('dayOfWeek').isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).withMessage('Invalid day of week'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:mm)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:mm)'),
];

const updateAvailabilityValidation = [
  body('dayOfWeek').optional().isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).withMessage('Invalid day of week'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:mm)'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:mm)'),
];

const bulkAddAvailabilityValidation = [
  body('slots').isArray({ min: 1 }).withMessage('Slots array is required'),
  body('slots.*.dayOfWeek').isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).withMessage('Invalid day of week'),
  body('slots.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:mm)'),
  body('slots.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:mm)'),
];

// Public routes
router.get('/tutor/:tutorId', AvailabilityController.getTutorAvailability);

// Protected routes (Tutor only)
router.get('/me', authenticate, isTutor, AvailabilityController.getOwnAvailability);
router.post('/', authenticate, isTutor, validate(addAvailabilityValidation), AvailabilityController.addAvailability);
router.post('/bulk', authenticate, isTutor, validate(bulkAddAvailabilityValidation), AvailabilityController.bulkAddAvailability);
router.put('/:availabilityId', authenticate, isTutor, validate(updateAvailabilityValidation), AvailabilityController.updateAvailability);
router.delete('/:availabilityId', authenticate, isTutor, AvailabilityController.deleteAvailability);
router.patch('/:availabilityId/toggle', authenticate, isTutor, AvailabilityController.toggleAvailability);

export default router;
