import { Router } from 'express';
import { body } from 'express-validator';
import  CategoryController  from './tutor-category.controller';
import { authenticate, isAdmin } from '../../../lib/middleware/authMiddleware';
import { validate } from '../../../lib/middleware/validation';


const router = Router();

// Validation rules
const createCategoryValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('slug').notEmpty().withMessage('Slug is required').trim(),
  body('description').optional().isString().trim(),
  body('icon').optional().isString().trim(),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid color format'),
];

const updateCategoryValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('slug').optional().notEmpty().withMessage('Slug cannot be empty').trim(),
  body('description').optional().isString().trim(),
  body('icon').optional().isString().trim(),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid color format'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:categoryId', CategoryController.getCategoryById);
router.get('/slug/:slug', CategoryController.getCategoryBySlug);

// Admin routes
router.post('/',CategoryController.createCategory);
router.put('/:categoryId', authenticate, isAdmin, validate(updateCategoryValidation), CategoryController.updateCategory);
router.delete('/:categoryId', authenticate, isAdmin, CategoryController.deleteCategory);
router.patch('/:categoryId/toggle-status', authenticate, isAdmin, CategoryController.toggleStatus);

export const CategoryRoutes = router;

