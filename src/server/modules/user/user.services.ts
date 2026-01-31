import { prisma } from "../../../lib/prisma";
import { GetUsersFilters, UpdateUserDto } from "../../../types";


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
async getAllUsers(filters: GetUsersFilters) {
    const where: any = {};

    if (filters.role && filters.role !== 'ALL') {
      where.role = filters.role;
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    return prisma.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
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
