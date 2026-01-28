import { CreateBookingDto, UpdateBookingDto, BookingFilters } from '../../../types';
import { calculateDuration } from '../../../utils/helper';
import { prisma } from '../../../lib/prisma';
import { Prisma } from '../../../../generated/prisma/client';

export class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(studentId: string, data: CreateBookingDto) {
    const { tutorId, subject, sessionDate, startTime, endTime, studentNotes } = data;

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    if (!tutorProfile.isAvailable) {
      throw new Error('Tutor is not currently available');
    }

    // Calculate duration and price
    const duration = calculateDuration(startTime, endTime);
    const price = (Number(tutorProfile.hourlyRate) * duration) / 60;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        studentId,
        tutorId,
        tutorProfileId: tutorProfile.id,
        subject,
        sessionDate: new Date(sessionDate),
        startTime,
        endTime,
        duration,
        price,
        studentNotes,
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutorProfile: {
          select: {
            id: true,
            title: true,
            hourlyRate: true,
          },
        },
      },
    });

    return booking;
  }

  /**
   * Get all booking 
   */
    async getAllBookings(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const bookings = await prisma.booking.findMany({
      skip,
      take: limit,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutorProfile: {
          select: {
            id: true,
            title: true,
            hourlyRate: true,
          },
        },
      },
    });
    return bookings;
  }
          

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutorProfile: {
          select: {
            id: true,
            title: true,
            hourlyRate: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  /**
   * Get user bookings
   */
  async getUserBookings(
    userId: string,
    userRole: string,
    filters: BookingFilters,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      ...(userRole === 'TUTOR' ? { tutorId: userId } : { studentId: userId }),
    };

    // Status filter
    if (filters.status) {
      where.status = filters.status as any;
    }

    // Date range filter
    if (filters.fromDate || filters.toDate) {
      where.sessionDate = {};
      if (filters.fromDate) {
        where.sessionDate.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.sessionDate.lte = filters.toDate;
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sessionDate: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tutor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tutorProfile: {
            select: {
              id: true,
              title: true,
            },
          },
          review: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update booking status
   */
  async updateBooking(bookingId: string, userId: string, data: UpdateBookingDto) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check authorization
    if (booking.studentId !== userId && booking.tutorId !== userId) {
      throw new Error('Not authorized to update this booking');
    }

    // Handle cancellation
    if (data.status === 'CANCELLED') {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledBy: userId,
          cancelReason: data.cancelReason,
          cancelledAt: new Date(),
          tutorNotes: data.tutorNotes,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tutor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updated;
    }

    // Regular update
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: data.status,
        tutorNotes: data.tutorNotes,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update tutor stats if completed
    if (data.status === 'COMPLETED') {
      await prisma.tutorProfile.update({
        where: { id: booking.tutorProfileId },
        data: {
          totalSessions: { increment: 1 },
        },
      });
    }

    return updated;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check authorization
    if (booking.studentId !== userId && booking.tutorId !== userId) {
      throw new Error('Not authorized to cancel this booking');
    }

    // Check if already cancelled or completed
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new Error('Cannot cancel this booking');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledBy: userId,
        cancelReason: reason,
        cancelledAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(userId: string, userRole: string) {
    const where = userRole === 'TUTOR' ? { tutorId: userId } : { studentId: userId };

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { ...where, status: 'PENDING' } }),
      prisma.booking.count({ where: { ...where, status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }
}

export default new BookingService();
