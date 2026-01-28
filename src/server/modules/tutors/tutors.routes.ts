import { Router } from 'express';
import { body } from 'express-validator';
import  TutorController  from './tutors.controller';
import { validate } from '../../../lib/middleware/validation';
import { authenticate, isTutor } from '../../../lib/middleware/authMiddleware';

const router = Router();

// Validation rules
const createProfileValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('headline').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('education').optional().isString().trim(),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one category is required'),
  body('categoryIds.*').isString().withMessage('Invalid category ID'),
];

const updateProfileValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('headline').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('education').optional().isString().trim(),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
  body('categoryIds').optional().isArray().withMessage('categoryIds must be an array'),
  body('categoryIds.*').optional().isString().withMessage('Invalid category ID'),
];

// Public routes
router.get('/search', TutorController.searchTutors);
router.get('/user/:userId', TutorController.getProfileByUserId);
router.get('/:tutorId', TutorController.getProfileById);

// Protected routes (Tutor only)
router.post('/profile', authenticate, validate(createProfileValidation), TutorController.createProfile);
router.get('/profile/me', authenticate, isTutor, TutorController.getOwnProfile);
router.put('/profile', authenticate, isTutor, validate(updateProfileValidation), TutorController.updateProfile);
router.patch('/availability/toggle', authenticate, isTutor, TutorController.toggleAvailability);

export const TutorRoutes = router;
