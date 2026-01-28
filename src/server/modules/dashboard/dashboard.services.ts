import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";

export class DashboardService {
  /**
   * Get student dashboard overview
   */
  async getStudentDashboard(studentId: string) {
    const [
      upcomingBookings,
      recentBookings,
      totalBookings,
      completedSessions,
      pendingSessions,
      totalSpent,
    ] = await Promise.all([
      // Upcoming bookings (confirmed, future sessions)
      prisma.booking.findMany({
        where: {
          studentId,
          status: 'CONFIRMED',
          sessionDate: {
            gte: new Date(),
          },
        },
        take: 5,
        orderBy: { sessionDate: 'asc' },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tutorProfile: {
            select: {
              title: true,
            },
          },
        },
      }),

      // Recent bookings
      prisma.booking.findMany({
        where: {
          studentId,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tutorProfile: {
            select: {
              title: true,
            },
          },
        },
      }),

      // Total bookings count
      prisma.booking.count({
        where: { studentId },
      }),

      // Completed sessions
      prisma.booking.count({
        where: {
          studentId,
          status: 'COMPLETED',
        },
      }),

      // Pending sessions (awaiting confirmation)
      prisma.booking.count({
        where: {
          studentId,
          status: 'PENDING',
        },
      }),

      // Total amount spent
      prisma.booking.aggregate({
        where: {
          studentId,
          status: 'COMPLETED',
        },
        _sum: {
          price: true,
        },
      }),
    ]);

    // Get favorite tutors (most booked)
    const favoriteTutors = await prisma.booking.groupBy({
      by: ['tutorId'],
      where: {
        studentId,
        status: {
          in: ['COMPLETED', 'CONFIRMED'],
        },
      },
      _count: {
        tutorId: true,
      },
      orderBy: {
        _count: {
          tutorId: 'desc',
        },
      },
      take: 3,
    });

    const tutorIds = favoriteTutors.map((t) => t.tutorId);
    const tutorDetails = await prisma.user.findMany({
      where: {
        id: {
          in: tutorIds,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        tutorProfile: {
          select: {
            id: true,
            title: true,
            averageRating: true,
          },
        },
      },
    });

    return {
      overview: {
        totalBookings,
        completedSessions,
        pendingSessions,
        totalSpent: totalSpent._sum.price || 0,
      },
      upcomingBookings,
      recentBookings,
      favoriteTutors: tutorDetails,
    };
  }

  /**
   * Get tutor dashboard overview
   */
  async getTutorDashboard(tutorId: string) {
    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    const [
      upcomingSessions,
      recentSessions,
      totalSessions,
      completedSessions,
      pendingSessions,
      totalEarnings,
      thisMonthEarnings,
      studentsCount,
    ] = await Promise.all([
      // Upcoming sessions (confirmed, future)
      prisma.booking.findMany({
        where: {
          tutorId,
          status: 'CONFIRMED',
          sessionDate: {
            gte: new Date(),
          },
        },
        take: 5,
        orderBy: { sessionDate: 'asc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      }),

      // Recent sessions
      prisma.booking.findMany({
        where: {
          tutorId,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),

      // Total sessions
      prisma.booking.count({
        where: { tutorId },
      }),

      // Completed sessions
      prisma.booking.count({
        where: {
          tutorId,
          status: 'COMPLETED',
        },
      }),

      // Pending sessions (awaiting confirmation)
      prisma.booking.count({
        where: {
          tutorId,
          status: 'PENDING',
        },
      }),

      // Total earnings
      prisma.booking.aggregate({
        where: {
          tutorId,
          status: 'COMPLETED',
        },
        _sum: {
          price: true,
        },
      }),

      // This month earnings
      prisma.booking.aggregate({
        where: {
          tutorId,
          status: 'COMPLETED',
          sessionDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: {
          price: true,
        },
      }),

      // Unique students count
      prisma.booking.findMany({
        where: {
          tutorId,
          status: {
            in: ['COMPLETED', 'CONFIRMED'],
          },
        },
        distinct: ['studentId'],
        select: {
          studentId: true,
        },
      }),
    ]);

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: {
        tutorId: tutorProfile.id,
        isVisible: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      overview: {
        totalSessions,
        completedSessions,
        pendingSessions,
        totalEarnings: totalEarnings._sum.price || 0,
        thisMonthEarnings: thisMonthEarnings._sum.price || 0,
        studentsCount: studentsCount.length,
        averageRating: tutorProfile.averageRating,
        totalReviews: tutorProfile.totalReviews,
      },
      upcomingSessions,
      recentSessions,
      recentReviews,
      profileStatus: {
        isAvailable: tutorProfile.isAvailable,
        isVerified: tutorProfile.isVerified,
      },
    };
  }

  /**
   * Get admin dashboard overview
   */
  async getAdminDashboard() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalTutors,
      totalStudents,
      totalBookings,
      completedBookings,
      thisMonthBookings,
      lastMonthBookings,
      totalRevenue,
      thisMonthRevenue,
      activeCategories,
      recentUsers,
      recentBookings,
      topTutors,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total tutors
      prisma.user.count({
        where: { role: 'TUTOR' },
      }),

      // Total students
      prisma.user.count({
        where: { role: 'STUDENT' },
      }),

      // Total bookings
      prisma.booking.count(),

      // Completed bookings
      prisma.booking.count({
        where: { status: 'COMPLETED' },
      }),

      // This month bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      }),

      // Last month bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
          },
        },
      }),

      // Total revenue
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: {
          price: true,
        },
      }),

      // This month revenue
      prisma.booking.aggregate({
        where: {
          status: 'COMPLETED',
          sessionDate: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          price: true,
        },
      }),

      // Active categories
      prisma.category.count({
        where: { isActive: true },
      }),

      // Recent users
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),

      // Recent bookings
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
      }),

      // Top tutors by sessions
      prisma.tutorProfile.findMany({
        take: 10,
        orderBy: { totalSessions: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const bookingGrowth = lastMonthBookings > 0
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
      : 0;

    return {
      overview: {
        totalUsers,
        totalTutors,
        totalStudents,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue._sum.price || 0,
        thisMonthRevenue: thisMonthRevenue._sum.price || 0,
        activeCategories,
        thisMonthBookings,
        lastMonthBookings,
        bookingGrowth: Math.round(bookingGrowth * 100) / 100,
      },
      recentUsers,
      recentBookings,
      topTutors,
    };
  }

  /**
   * Get booking statistics by date range
   */
  async getBookingStatsByDateRange(startDate: Date, endDate: Date, tutorId?: string) {
    const where: Prisma.BookingWhereInput = {
      sessionDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (tutorId) {
      where.tutorId = tutorId;
    }

    const [bookings, revenue] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          status: true,
          sessionDate: true,
          price: true,
        },
      }),
      prisma.booking.aggregate({
        where: {
          ...where,
          status: 'COMPLETED',
        },
        _sum: {
          price: true,
        },
      }),
    ]);

    // Group by date
    const bookingsByDate = bookings.reduce((acc, booking) => {
      const date = booking.sessionDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          completed: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          revenue: 0,
        };
      }
      acc[date].total++;
      acc[date][booking.status.toLowerCase() as keyof typeof acc[typeof date]]++;
      if (booking.status === 'COMPLETED') {
        acc[date].revenue += Number(booking.price);
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      totalRevenue: revenue._sum.price || 0,
      bookingsByDate: Object.values(bookingsByDate),
    };
  }
}

export default new DashboardService();
