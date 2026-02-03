# Frontend Files Complete Reference

This document lists every frontend file with quick descriptions. Use this as a checklist when setting up the separate frontend repository.

## Configuration Files (Root Level)

### package.json
```json
{
  "name": "skill-bridge-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^16.0.0",
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-form": "^0.11.0",
    "@tanstack/zod-form-adapter": "^0.11.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "better-auth": "^1.4.17",
    "zod": "^3.22.4",
    "tailwindcss": "^3.4.1",
    "sonner": "^1.3.1"
  }
}
```
**Purpose**: Lists all npm dependencies and scripts.

### .env.example
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001

# Development
NODE_ENV=development
```
**Purpose**: Template for environment variables. Copy to `.env.local` and update values.

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "noEmit": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```
**Purpose**: TypeScript configuration with path alias `@/` for imports.

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```
**Purpose**: Tailwind CSS configuration and content paths.

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
**Purpose**: PostCSS plugins for processing CSS.

### next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
```
**Purpose**: Next.js configuration for performance and image optimization.

## Root Component Files

### providers.tsx
Wraps entire app with:
- Redux store provider
- TanStack Query client provider
- Sonner toaster
- Auth provider

### app/layout.tsx
Root layout with:
- Metadata configuration
- Font loading (Geist Sans/Mono)
- Global CSS import
- Providers wrapper

### app/globals.css
Global Tailwind CSS imports and base styles.

### app/page.tsx
Landing page with:
- Feature overview
- Hero section
- CTA buttons
- Sign in/up links

### app/error.tsx
Error boundary component for catching errors.

### app/not-found.tsx
404 page when route not found.

## Authentication Files

### app/auth/signin/page.tsx
Sign in page wrapper for login form.

### app/auth/signup/page.tsx
Sign up page with role selection (Student/Tutor).

### components/auth/sign-in-form.tsx
Form component with:
- Email input
- Password input
- Form submission
- Error handling
- Loading state

### components/auth/sign-up-form.tsx
Form component with:
- Name input
- Email input
- Password input
- Role selection (Student/Tutor)
- Terms acceptance
- Form validation

### lib/auth/auth-client.ts
Better Auth client initialization:
- Client setup with API endpoint
- Session management
- Sign up/in/out methods

### lib/auth/auth-provider.tsx
React context provider for:
- Session fetching
- Auth state management
- Redux dispatch on auth changes
- useAuth hook export

## Dashboard Files

### app/dashboard/layout.tsx
Dashboard layout with:
- Sidebar component
- Header component
- Main content area
- Auth protection

### app/dashboard/page.tsx
Main dashboard with:
- User overview cards
- Quick actions
- Recent activity
- Dashboard stats

### app/dashboard/profile/page.tsx
User profile edit page with:
- Profile form
- Avatar upload
- Bio and contact info
- Form submission

### app/dashboard/tutors/page.tsx
Tutor search and browse page with:
- Search filters (category, price, rating)
- Tutor list/grid
- Pagination
- Results count

### app/dashboard/tutors/[tutorId]/page.tsx
Individual tutor profile with:
- Tutor info and bio
- Hourly rate
- Categories
- Reviews section
- Booking button/form

### app/dashboard/tutor/profile/page.tsx
Tutor profile creation/edit with:
- Profile information form
- Category selection
- Availability summary
- Rate setting
- Bio and education

### app/dashboard/bookings/page.tsx
Manage bookings page with:
- Booking list
- Status filtering
- Booking details
- Cancel option

### app/dashboard/availability/page.tsx
Tutor availability management with:
- Weekly schedule view
- Add/edit time slots
- Day selection
- Time pickers
- Bulk upload option

## Components

### components/layout/sidebar.tsx
Navigation sidebar with:
- Logo
- Menu items (dashboard, tutors, bookings, etc.)
- Role-based links (tutor-specific)
- Sign out button
- Responsive drawer (mobile)

### components/layout/header.tsx
Top header with:
- Logo/brand
- User menu dropdown
- Notifications icon
- Mobile menu toggle

### components/tutors/tutor-card.tsx
Card displaying tutor info:
- Avatar
- Name and title
- Hourly rate
- Average rating
- Category tags
- View profile link

### components/bookings/booking-form.tsx
Form for creating bookings with:
- Date picker
- Time selection
- Subject input
- Duration selection
- Cost estimation
- Student notes
- Submit button

### components/bookings/booking-card.tsx
Card displaying booking info:
- Tutor name and avatar
- Date and time
- Subject and cost
- Booking status
- Action buttons (confirm, cancel, complete)

### components/ui/toaster.tsx
Toast notification system using Sonner.

## Library Files

### lib/api/client.ts
Centralized API client with:
- Base URL configuration
- Error handling
- GET, POST, PUT, DELETE methods
- Auth header injection
- Credential inclusion

**Key functions:**
```typescript
export const apiClient = {
  get: (url: string) => Promise
  post: (url: string, data: any) => Promise
  put: (url: string, data: any) => Promise
  delete: (url: string) => Promise
}
```

### lib/api/query-client.ts
TanStack Query client configuration with:
- Query defaults (staleTime, cacheTime)
- Retry logic
- Error handling

### lib/hooks/use-users.ts
Custom hooks for user operations:
- `useGetProfile()` - Fetch user profile
- `useUpdateProfile()` - Update profile info

### lib/hooks/use-tutors.ts
Custom hooks for tutor operations:
- `useGetTutors()` - List all tutors
- `useSearchTutors()` - Search with filters
- `useGetTutorProfile()` - Get single tutor
- `useCreateTutorProfile()` - Create profile
- `useUpdateTutorProfile()` - Update profile

### lib/hooks/use-bookings.ts
Custom hooks for booking operations:
- `useCreateBooking()` - Create new booking
- `useGetMyBookings()` - Get user bookings
- `useGetBooking()` - Get single booking
- `useUpdateBooking()` - Update status
- `useCancelBooking()` - Cancel booking

### lib/hooks/use-categories.ts
Custom hooks for categories:
- `useGetCategories()` - List all categories

### lib/hooks/use-availability.ts
Custom hooks for availability:
- `useGetAvailability()` - Get tutor availability
- `useAddAvailability()` - Add slot
- `useBulkAddAvailability()` - Add multiple slots

### lib/hooks/use-reviews.ts
Custom hooks for reviews:
- `useGetTutorReviews()` - Get tutor reviews
- `useCreateReview()` - Create review
- `useRespondToReview()` - Tutor response

### lib/redux/store.ts
Redux store configuration:
```typescript
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
})
```

### lib/redux/slices/auth-slice.ts
Redux slice for auth state:
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
}
```

Actions: `setUser`, `setLoading`, `clearAuth`, `setError`

### lib/redux/slices/ui-slice.ts
Redux slice for UI state:
```typescript
{
  sidebarOpen: boolean,
  theme: 'light' | 'dark',
  notifications: Notification[],
}
```

Actions: `toggleSidebar`, `setTheme`, `addNotification`, `removeNotification`

### lib/redux/hooks.ts
Typed Redux hooks:
- `useAppDispatch`
- `useAppSelector`

### lib/redux/provider.tsx
Redux provider component wrapper.

## Validation Files

### lib/validations/auth.ts
Zod schemas for auth forms:

**SignInSchema**
```typescript
{
  email: string (email)
  password: string (min 8)
}
```

**SignUpSchema**
```typescript
{
  name: string (min 2)
  email: string (email)
  password: string (min 8)
  confirmPassword: string
  role: 'STUDENT' | 'TUTOR'
}
```

### lib/validations/tutor.ts
Zod schemas for tutor forms:

**TutorProfileSchema**
```typescript
{
  title: string (min 3)
  headline: string (optional)
  description: string (min 10)
  hourlyRate: number (min 1)
  experience: number
  education: string (optional)
  categoryIds: string[]
}
```

**AvailabilitySchema**
```typescript
{
  dayOfWeek: 'MONDAY' | 'TUESDAY' | ...
  startTime: string (HH:mm)
  endTime: string (HH:mm)
}
```

### lib/validations/booking.ts
Zod schemas for booking form:

**BookingSchema**
```typescript
{
  tutorId: string
  subject: string (min 3)
  sessionDate: date
  startTime: string (HH:mm)
  endTime: string (HH:mm)
  studentNotes: string (optional)
}
```

## Types File

### types/api.ts
TypeScript interfaces for API responses:

```typescript
// User
interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
  avatar?: string
  createdAt: Date
}

// Tutor Profile
interface TutorProfile {
  id: string
  userId: string
  title: string
  description: string
  hourlyRate: number
  averageRating: number
  reviewCount: number
  categories: Category[]
}

// Booking
interface Booking {
  id: string
  studentId: string
  tutorId: string
  subject: string
  sessionDate: Date
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  totalCost: number
  createdAt: Date
}

// Review
interface Review {
  id: string
  bookingId: string
  rating: number (1-5)
  comment: string
  tutorResponse?: string
  createdAt: Date
}

// Category
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

// Availability
interface Availability {
  id: string
  tutorId: string
  dayOfWeek: string
  startTime: string
  endTime: string
}
```

## Key Patterns

### Creating an API Hook

```typescript
// lib/hooks/use-resource.ts
export function useGetResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/resource/${id}`)
      if (!response.success) throw new Error(response.error)
      return response.data as Resource
    },
  })
}
```

### Using in a Component

```typescript
'use client'
import { useGetResource } from '@/lib/hooks/use-resource'

export function MyComponent() {
  const { data, isLoading } = useGetResource('123')
  
  if (isLoading) return <div>Loading...</div>
  return <div>{data?.name}</div>
}
```

### Creating a Form

```typescript
'use client'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { schema } from '@/lib/validations/form'

export function MyForm() {
  const form = useForm({
    defaultValues: { name: '', email: '' },
    validators: zodValidator(schema),
    onSubmit: async ({ value }) => {
      await apiClient.post('/api/submit', value)
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      <input {...form.getFieldProps('name')} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Using Redux State

```typescript
'use client'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setUser } from '@/lib/redux/slices/auth-slice'

export function MyComponent() {
  const user = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch()

  return (
    <button onClick={() => dispatch(setUser(newUser))}>
      {user?.name}
    </button>
  )
}
```

## File Checklist

When setting up the separate frontend, ensure you have:

**Configuration (6 files)**
- [ ] package.json
- [ ] .env.example
- [ ] tsconfig.json
- [ ] tailwind.config.ts
- [ ] postcss.config.js
- [ ] next.config.mjs

**Root Components (6 files)**
- [ ] providers.tsx
- [ ] app/layout.tsx
- [ ] app/globals.css
- [ ] app/page.tsx
- [ ] app/error.tsx
- [ ] app/not-found.tsx

**Auth (6 files)**
- [ ] app/auth/signin/page.tsx
- [ ] app/auth/signup/page.tsx
- [ ] components/auth/sign-in-form.tsx
- [ ] components/auth/sign-up-form.tsx
- [ ] lib/auth/auth-client.ts
- [ ] lib/auth/auth-provider.tsx

**Dashboard (8 files)**
- [ ] app/dashboard/layout.tsx
- [ ] app/dashboard/page.tsx
- [ ] app/dashboard/profile/page.tsx
- [ ] app/dashboard/tutors/page.tsx
- [ ] app/dashboard/tutors/[tutorId]/page.tsx
- [ ] app/dashboard/tutor/profile/page.tsx
- [ ] app/dashboard/bookings/page.tsx
- [ ] app/dashboard/availability/page.tsx

**Components (5 files)**
- [ ] components/layout/sidebar.tsx
- [ ] components/layout/header.tsx
- [ ] components/tutors/tutor-card.tsx
- [ ] components/bookings/booking-form.tsx
- [ ] components/bookings/booking-card.tsx
- [ ] components/ui/toaster.tsx

**Library - API (2 files)**
- [ ] lib/api/client.ts
- [ ] lib/api/query-client.ts

**Library - Hooks (6 files)**
- [ ] lib/hooks/use-users.ts
- [ ] lib/hooks/use-tutors.ts
- [ ] lib/hooks/use-bookings.ts
- [ ] lib/hooks/use-categories.ts
- [ ] lib/hooks/use-availability.ts
- [ ] lib/hooks/use-reviews.ts

**Library - Redux (7 files)**
- [ ] lib/redux/store.ts
- [ ] lib/redux/slices/auth-slice.ts
- [ ] lib/redux/slices/ui-slice.ts
- [ ] lib/redux/hooks.ts
- [ ] lib/redux/provider.tsx

**Library - Validations (3 files)**
- [ ] lib/validations/auth.ts
- [ ] lib/validations/tutor.ts
- [ ] lib/validations/booking.ts

**Types (1 file)**
- [ ] types/api.ts

**Documentation (3 files)**
- [ ] README.md
- [ ] DEPLOYMENT.md
- [ ] SETUP_GUIDE.md

**Total: 53 files**

## Summary

This frontend is organized for:
- **Scalability** - Modular structure with clear separation of concerns
- **Maintainability** - Easy to find and update features
- **Type Safety** - Full TypeScript throughout
- **Production Ready** - Proper error handling and deployment configs
- **Cookie Safety** - Better Auth configured correctly for deployments

All files follow Next.js best practices and are ready to deploy to Vercel or self-hosted platforms.
