export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Array<{ field: string; message: string }>
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
  status: string
  emailVerified?: boolean
  image?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export interface TutorProfile {
  id: string
  userId: string
  title: string
  headline?: string
  description?: string
  hourlyRate: number
  experience?: number
  education?: string
  rating?: number
  reviewCount?: number
  isAvailable: boolean
  categories?: Category[]
  user?: AuthUser
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
}

export interface Booking {
  id: string
  studentId: string
  tutorId: string
  subject: string
  sessionDate: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  studentNotes?: string
  tutorNotes?: string
  cancelReason?: string
  student?: AuthUser
  tutor?: TutorProfile
  review?: Review
  createdAt: string
  updatedAt: string
}

export interface Availability {
  id: string
  tutorId: string
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
}

export interface Review {
  id: string
  bookingId: string
  studentId: string
  tutorId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface DashboardStats {
  totalStudents?: number
  totalBookings?: number
  totalEarnings?: number
  totalReviews?: number
  averageRating?: number
  upcomingSessions?: number
  completedSessions?: number
}
