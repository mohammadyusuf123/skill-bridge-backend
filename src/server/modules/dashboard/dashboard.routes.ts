import { Router } from 'express';
import { authenticate, authorize, UserRole } from '../../../lib/middleware/authMiddleware';
import  DashboardController  from './dashboard.controller';

const router = Router();

// Student dashboard
router.get(
  '/student',
  authenticate,
  authorize(UserRole.STUDENT),
  DashboardController.getStudentDashboard
);

// Tutor dashboard
router.get(
  '/tutor',
  authenticate,
  authorize(UserRole.TUTOR, UserRole.ADMIN),
  DashboardController.getTutorDashboard
);

// Admin dashboard
router.get(
  '/admin',
  authenticate,
  authorize(UserRole.ADMIN),
  DashboardController.getAdminDashboard
);

// Booking statistics
router.get(
  '/stats',
  authenticate,
  DashboardController.getBookingStats
);

export const DashboardRoutes = router;
