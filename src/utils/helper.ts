import { ApiResponse, PaginationParams } from '../types/index';

/**
 * Create a successful API response
 */
export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
  };
};

/**
 * Create an error API response
 */
export const errorResponse = (error: string, errors?: Array<{ field: string; message: string }>): ApiResponse => {
  return {
    success: false,
    error,
    errors,
  };
};

/**
 * Calculate pagination parameters
 */
export const getPagination = (page: number = 1, limit: number = 10): PaginationParams => {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
  const skip = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    skip,
  };
};

/**
 * Calculate total pages
 */
export const getTotalPages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};

/**
 * Validate time format (HH:mm)
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Calculate duration in minutes between two times
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;

  return endInMinutes - startInMinutes;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate slug from string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query.trim().replace(/[^\w\s]/gi, '');
};
