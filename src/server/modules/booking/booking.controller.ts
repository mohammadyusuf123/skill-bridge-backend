import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { errorResponse, successResponse } from '../../../utils/helper';
import  BookingService  from './booking.services';
import { ApiError } from '../../../utils/apiError';

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
//get all bookings
async getAllBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await BookingService.getAllBookings();
    res.json(successResponse(bookings));
  } catch (error) {
    next(error);
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
 async getMyBookings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { id: userId, role: userRole } = req.user;

      const bookings = await BookingService.getMyBookings(
        userId,
        userRole
      );

      res.json({
        success: true,
        data: {
          data: bookings,
          meta: {
            total: bookings.length,
            page: 1,
            limit: bookings.length,
            totalPages: 1,
          },
        },
      });
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
async markAsComplete(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    console.log('REQ USER:', req.user);
    console.log('REQ PARAMS:', req.params);
    console.log('REQ BODY:', req.body);

    if (!req.user) throw new Error('Not authenticated');

    const { bookingId } = req.params;
    const { tutorNotes } = req.body;

    const booking = await BookingService.markAsComplete(
      bookingId as string,
      req.user.id,
      tutorNotes
    );

    res.json(successResponse(booking, 'Booking marked as complete'));
  } catch (error) {
    console.error('MARK COMPLETE ERROR:', error);
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
