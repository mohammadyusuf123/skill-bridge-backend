import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, isAdmin } from '../../../lib/middleware/authMiddleware';
import  UserController  from './user.controller';
import { validate } from '../../../lib/middleware/validation';

const router = Router();

// Validation rules
const updateProfileValidation = [
  body('name').optional().isString().trim(),
  body('bio').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
];

const updateRoleValidation = [
  body('role').isIn(['STUDENT', 'TUTOR', 'ADMIN']).withMessage('Invalid role'),
];

const updateStatusValidation = [
  body('status').isIn(['ACTIVE', 'BANNED', 'SUSPENDED']).withMessage('Invalid status'),
];

// Protected routes - User profile
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validate(updateProfileValidation), UserController.updateProfile);
router.get('/:userId', authenticate, UserController.getUserById);

// Admin routes - User management
router.get('/', authenticate, isAdmin, UserController.getAllUsers);
router.delete('/:userId', authenticate, isAdmin, UserController.deleteUser);
router.patch('/:userId/role', authenticate, isAdmin, validate(updateRoleValidation), UserController.updateUserRole);
router.patch('/:userId/status', authenticate, isAdmin, validate(updateStatusValidation), UserController.updateUserStatus);

export const UserRoutes = router;
