import { prisma } from "../../../lib/prisma";
import { CreateAvailabilityDto } from "../../../types";
import { isValidTimeFormat } from "../../../utils/helper";


export class AvailabilityService {
  /**
   * Add availability slot
   */
  async addAvailability(userId: string, data: CreateAvailabilityDto) {
    const { dayOfWeek, startTime, endTime } = data;

    // Validate time format
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      throw new Error('Invalid time format. Use HH:mm format (e.g., 09:00)');
    }

    // Validate time range
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Check for overlapping availability
    const overlapping = await prisma.availability.findFirst({
      where: {
        tutorId: tutorProfile.id,
        dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new Error('This time slot overlaps with existing availability');
    }

    // Create availability
    const availability = await prisma.availability.create({
      data: {
        tutorId: tutorProfile.id,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return availability;
  }

  /**
   * Get tutor availability
   */
  async getTutorAvailability(tutorId: string) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    const availability = await prisma.availability.findMany({
      where: {
        tutorId: tutorProfile.id,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    // Group by day of week
    const grouped = availability.reduce((acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek].push(slot);
      return acc;
    }, {} as Record<string, typeof availability>);

    return grouped;
  }

  /**
   * Update availability slot
   */
  async updateAvailability(
    availabilityId: string,
    userId: string,
    data: Partial<CreateAvailabilityDto>
  ) {
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        tutor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!availability) {
      throw new Error('Availability slot not found');
    }

    if (availability.tutor.userId !== userId) {
      throw new Error('Not authorized to update this availability');
    }

    // Validate time format if provided
    if (data.startTime && !isValidTimeFormat(data.startTime)) {
      throw new Error('Invalid start time format. Use HH:mm format (e.g., 09:00)');
    }

    if (data.endTime && !isValidTimeFormat(data.endTime)) {
      throw new Error('Invalid end time format. Use HH:mm format (e.g., 17:00)');
    }

    // Validate time range if both times are provided
    const startTime = data.startTime || availability.startTime;
    const endTime = data.endTime || availability.endTime;

    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    const updated = await prisma.availability.update({
      where: { id: availabilityId },
      data,
    });

    return updated;
  }

  /**
   * Delete availability slot
   */
  async deleteAvailability(availabilityId: string, userId: string) {
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        tutor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!availability) {
      throw new Error('Availability slot not found');
    }

    if (availability.tutor.userId !== userId) {
      throw new Error('Not authorized to delete this availability');
    }

    await prisma.availability.delete({
      where: { id: availabilityId },
    });

    return { message: 'Availability slot deleted successfully' };
  }

  /**
   * Toggle availability slot active status
   */
  async toggleAvailability(availabilityId: string, userId: string) {
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        tutor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!availability) {
      throw new Error('Availability slot not found');
    }

    if (availability.tutor.userId !== userId) {
      throw new Error('Not authorized to update this availability');
    }

    const updated = await prisma.availability.update({
      where: { id: availabilityId },
      data: {
        isActive: !availability.isActive,
      },
    });

    return updated;
  }

  /**
   * Bulk add availability (for multiple days/times)
   */
  async bulkAddAvailability(userId: string, slots: CreateAvailabilityDto[]) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Validate all slots
    for (const slot of slots) {
      if (!isValidTimeFormat(slot.startTime) || !isValidTimeFormat(slot.endTime)) {
        throw new Error('Invalid time format in one or more slots');
      }
      if (slot.startTime >= slot.endTime) {
        throw new Error('Start time must be before end time in all slots');
      }
    }

    // Create all slots
    const created = await prisma.availability.createMany({
      data: slots.map(slot => ({
        tutorId: tutorProfile.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    return created;
  }
}

export default new AvailabilityService();
