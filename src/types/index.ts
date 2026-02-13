import { Request } from 'express';
import { UserRole, UserStatus } from '../../generated/prisma/enums';
// User types
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
}

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query filters
export interface TutorFilters {
  categoryId?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  isAvailable?: boolean;
  search?: string;
}
// Specific filter for searching tutors
export interface TutorSearchFilters {
  categoryId?: string;
  search?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
}
// Booking filters
export interface BookingFilters {
  status?: string;
  tutorId?: string;
  studentId?: string;
  fromDate?: Date;
  toDate?: Date;
}

// DTOs (Data Transfer Objects)
export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role?: 'STUDENT' | 'TUTOR';
}

export interface UpdateUserDto {
  name?: string;
  bio?: string;
  phone?: string;
  image?: string;
}

export interface CreateTutorProfileDto {
  title: string;
  headline?: string;
  description?: string;
  hourlyRate: number;
  experience?: number;
  education?: string;
  categoryIds: string[];
}

export interface UpdateTutorProfileDto {
  title?: string;
  headline?: string;
  description?: string;
  hourlyRate?: number;
  experience?: number;
  education?: string;
  isAvailable?: boolean;
  categoryIds?: string[];
}

export interface CreateAvailabilityDto {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
}

export interface CreateBookingDto {
  tutorId: string;
  subject: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  studentNotes?: string;
}

export interface UpdateBookingDto {
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  tutorNotes?: string;
  cancelReason?: string;
}

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}
// Filters for getting users
export interface GetUsersFilters {
  role?: string;
  status?: string;
}

// Review creation input
export interface CreateReviewInput {
  bookingId: string;
  studentId: string;
  rating: number;
  comment?: string;
}

 export interface MarkCompleteOptions {
  bookingId: string;
  tutorId: string;
  tutorNotes?: string;
  force?: boolean;        // allow manual override
  graceMinutes?: number;  // default grace period after session end
}