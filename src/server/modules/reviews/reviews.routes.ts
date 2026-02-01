import { Router } from 'express';
import { body } from 'express-validator';
import  ReviewController  from './reviews.controller';
import { authenticate, isAdmin, isTutor } from '../../../lib/middleware/authMiddleware';
import { validate } from '../../../lib/middleware/validation';

const router = Router();

// Validation rules
const createReviewValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().trim(),
];

const respondToReviewValidation = [
  body('response').notEmpty().withMessage('Response is required').trim(),
];

// Public routes
router.get('/tutor/:tutorId', ReviewController.getTutorReviews);
router.get('/:reviewId', ReviewController.getReviewById);

// Protected routes (Student)
router.post('/', authenticate, validate(createReviewValidation), ReviewController.createReview);

// Protected routes (Tutor)
router.post('/:reviewId/respond', authenticate, isTutor, validate(respondToReviewValidation), ReviewController.respondToReview);

// Admin routes
router.delete('/:reviewId', authenticate, isAdmin, ReviewController.deleteReview);

export const ReviewRoutes = router;
