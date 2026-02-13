import { Prisma, UserRole } from '../../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';
import { BookingFilters, CreateBookingDto, UpdateBookingDto } from '../../../types';
import { calculateDuration } from '../../../utils/helper';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { parseISO } from 'date-fns';

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

    // Create booking with CONFIRMED status (instant confirmation)
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
        status: 'CONFIRMED', // Instant confirmation
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
// get all bookings
async getAllBookings() {
    const bookings = await prisma.booking.findMany({
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
async getMyBookings(userId: string, userRole: UserRole) {
    let where: any = {};

    if (userRole === 'STUDENT') {
      where.studentId = userId;
    } else if (userRole === 'TUTOR') {
      where.tutorId = userId;
    }
    // ADMIN → no filter

    return prisma.booking.findMany({
      where,
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
          include: {
            user: true,
          },
        },
        review: true,
      },
      orderBy: {
        sessionDate: 'desc',
      },
    });
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

    // Update booking status and notes
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
   * Mark booking as complete (Tutor only)
   */
async markAsComplete(
  bookingId: string,
  tutorId: string,
  tutorNotes?: string
) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.tutorId !== tutorId) {
      throw new Error('Not authorized to complete this booking');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Can only complete confirmed bookings');
    }

    // ✅ User's timezone (store this with booking or user profile)
    const userTimezone = 'Asia/Dhaka';
    
    // Combine date and time in user's timezone
    const sessionDateStr = booking.sessionDate.toISOString().split('T')[0];
    const dateTimeStr = `${sessionDateStr}T${booking.endTime}:00`;
    
    // Parse as if it's in user's timezone, get UTC
    const sessionEndDateTimeUTC = toDate(dateTimeStr, { timeZone: userTimezone });
    
    const now = new Date();
    const graceMinutes = 15;
    const sessionEndWithGrace = new Date(
      sessionEndDateTimeUTC.getTime() - (graceMinutes * 60 * 1000)
    );

    console.log('=== DEBUGGING DATETIME ===');
    console.log('User timezone:', userTimezone);
    console.log('Session end (user TZ):', formatInTimeZone(sessionEndDateTimeUTC, userTimezone, 'yyyy-MM-dd HH:mm:ss zzz'));
    console.log('Session end (UTC):', sessionEndDateTimeUTC.toISOString());
    console.log('Current (user TZ):', formatInTimeZone(now, userTimezone, 'yyyy-MM-dd HH:mm:ss zzz'));
    console.log('Current (UTC):', now.toISOString());
    console.log('Can complete?:', now >= sessionEndWithGrace);
    console.log('========================');

    if (now < sessionEndWithGrace) {
      const minutesUntil = Math.ceil((sessionEndWithGrace.getTime() - now.getTime()) / 1000 / 60);
      throw new Error(
        `Cannot mark booking as complete yet. Session ends at ${booking.endTime} Bangladesh time. Wait ${minutesUntil} more minute(s).`
      );
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        tutorNotes: tutorNotes ?? 'Marked as completed by tutor.',
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutor: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.tutorProfile.update({
      where: { id: booking.tutorProfileId },
      data: { totalSessions: { increment: 1 } },
    });

    return updated;
  });
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
