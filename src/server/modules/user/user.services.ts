import { prisma } from "../../../lib/prisma";
import { UpdateUserDto } from "../../../types";


export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        image: true,
        bio: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        tutorProfile: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateUserDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        image: true,
        bio: true,
        phone: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 10, filters?: { role?: string; status?: string }) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: 'STUDENT' | 'TUTOR' | 'ADMIN') {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return user;
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BANNED' | 'SUSPENDED') {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return user;
  }
}

export default new UserService();
