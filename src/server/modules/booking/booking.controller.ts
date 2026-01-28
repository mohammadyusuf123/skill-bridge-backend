import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { errorResponse, successResponse } from '../../../utils/helper';
import  BookingService  from './booking.services';

export class BookingController {
  /**
   * Create a new booking
   */
  async createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const booking = await BookingService.createBooking(req.user.id, req.body);
      res.status(201).json(successResponse(booking, 'Booking created successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const booking = await BookingService.getBookingById(bookingId as string);

      // Check authorization
      if (req.user && booking.studentId !== req.user.id && booking.tutorId !== req.user.id) {
        res.status(403).json(errorResponse('Not authorized to view this booking'));
        return;
      }

      res.json(successResponse(booking));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        status: req.query.status as string | undefined,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
      };

      const result = await BookingService.getUserBookings(
        req.user.id,
        req.user.role,
        filters,
        page,
        limit
      );

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update booking
   */
  async updateBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { bookingId } = req.params;
      const booking = await BookingService.updateBooking(bookingId as string, req.user.id, req.body);
      res.json(successResponse(booking, 'Booking updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { bookingId } = req.params;
      const { reason } = req.body;

      const booking = await BookingService.cancelBooking(bookingId as string, req.user.id, reason);
      res.json(successResponse(booking, 'Booking cancelled successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Mark booking as complete (Tutor only)
   */
  async markAsComplete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { bookingId } = req.params;
      const { tutorNotes } = req.body;

      const booking = await BookingService.markAsComplete(bookingId as string, req.user.id, tutorNotes);
      res.json(successResponse(booking, 'Booking marked as complete'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const stats = await BookingService.getBookingStats(req.user.id, req.user.role);
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingController();
