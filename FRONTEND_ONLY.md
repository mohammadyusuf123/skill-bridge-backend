# Skill Bridge Frontend - Separate Repository Setup

This document provides the complete frontend file structure for setting up the frontend as a **separate, independent repository**.

## Quick Start

### Clone or Create New Frontend Project

```bash
# Option 1: Create a new Next.js project
npx create-next-app@latest skill-bridge-frontend --typescript --tailwind

# Option 2: Clone this repo (if shared as separate repo)
git clone <frontend-repo-url>
cd skill-bridge-frontend

# Install dependencies
npm install
```

## Complete File Structure

```
skill-bridge-frontend/
│
├── .env.example                    # Environment template
├── .env.local                      # Local environment (create this)
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── package-lock.json               # Dependency lock file
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind CSS config
├── postcss.config.js               # PostCSS config
├── next.config.mjs                 # Next.js config
│
├── README.md                       # Project overview
├── DEPLOYMENT.md                   # Deployment guides
├── SETUP_GUIDE.md                  # Setup instructions
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout with providers
│   ├── page.tsx                    # Landing page
│   ├── globals.css                 # Global styles
│   ├── error.tsx                   # Error boundary
│   ├── not-found.tsx               # 404 page
│   │
│   ├── auth/
│   │   ├── signin/page.tsx         # Sign in page
│   │   └── signup/page.tsx         # Sign up page
│   │
│   └── dashboard/
│       ├── layout.tsx              # Dashboard layout with sidebar
│       ├── page.tsx                # Main dashboard
│       │
│       ├── profile/
│       │   └── page.tsx            # User profile edit
│       │
│       ├── tutors/
│       │   ├── page.tsx            # Search/browse tutors
│       │   └── [tutorId]/
│       │       └── page.tsx        # Individual tutor profile
│       │
│       ├── tutor/
│       │   └── profile/
│       │       └── page.tsx        # Create/edit tutor profile
│       │
│       ├── bookings/
│       │   └── page.tsx            # Manage user bookings
│       │
│       └── availability/
│           └── page.tsx            # Manage tutor availability
│
├── components/
│   ├── auth/
│   │   ├── sign-in-form.tsx        # Sign in form
│   │   └── sign-up-form.tsx        # Sign up form
│   │
│   ├── bookings/
│   │   ├── booking-form.tsx        # Create booking form
│   │   └── booking-card.tsx        # Booking display card
│   │
│   ├── tutors/
│   │   └── tutor-card.tsx          # Tutor profile card
│   │
│   ├── layout/
│   │   ├── sidebar.tsx             # Navigation sidebar
│   │   └── header.tsx              # Header with user menu
│   │
│   └── ui/
│       └── toaster.tsx             # Toast notifications
│
├── lib/
│   ├── api/
│   │   ├── client.ts               # Centralized API client
│   │   └── query-client.ts         # TanStack Query setup
│   │
│   ├── auth/
│   │   ├── auth-client.ts          # Better Auth client
│   │   └── auth-provider.tsx       # Auth provider component
│   │
│   ├── hooks/
│   │   ├── use-users.ts            # User API hooks
│   │   ├── use-tutors.ts           # Tutor API hooks
│   │   ├── use-bookings.ts         # Booking API hooks
│   │   ├── use-categories.ts       # Category API hooks
│   │   ├── use-availability.ts     # Availability hooks
│   │   └── use-reviews.ts          # Review API hooks
│   │
│   ├── redux/
│   │   ├── store.ts                # Redux store config
│   │   ├── hooks.ts                # Redux hooks
│   │   ├── provider.tsx            # Redux provider
│   │   └── slices/
│   │       ├── auth-slice.ts       # Auth state
│   │       └── ui-slice.ts         # UI state
│   │
│   ├── validations/
│   │   ├── auth.ts                 # Auth form schemas
│   │   ├── tutor.ts                # Tutor form schemas
│   │   └── booking.ts              # Booking form schemas
│   │
│   └── utils.ts                    # Utility functions
│
├── types/
│   └── api.ts                      # API response types
│
└── providers.tsx                   # Root providers (Auth + Redux + Query)
```

## Installation Steps

### 1. Create or Clone Project

```bash
# Create new Next.js project
npx create-next-app@latest skill-bridge-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-git \
  --import-alias '@/*'

cd skill-bridge-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Copy Files

Copy all files from this repository into your new project, overwriting defaults.

**Key directories to copy:**
- `/app` → Replace existing
- `/components` → Replace existing
- `/lib` → New directory
- `/types` → New directory
- All config files (next.config.mjs, tailwind.config.ts, etc.)

### 4. Set Environment Variables

Create `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001

# Development
NODE_ENV=development
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## File Contents Summary

### Configuration Files

**package.json** - Dependencies
- React 19, Next.js 16, TypeScript 5
- Redux Toolkit, TanStack Query/Form
- Better Auth, Zod, Tailwind CSS
- Includes dev scripts: dev, build, start, lint

**tsconfig.json** - TypeScript config
- Target: ES2020
- Module: ESNext
- Path alias: `@/*`
- Strict mode enabled

**tailwind.config.ts** - Tailwind configuration
- Extends default theme
- CSS-in-JS safe list
- Customization ready

**next.config.mjs** - Next.js configuration
- App Router enabled
- Images optimized
- Production optimizations

**postcss.config.js** - PostCSS configuration
- Tailwind CSS integration
- Autoprefixer enabled

### Core Setup

**providers.tsx** - Root providers
- Redux Provider wraps everything
- QueryClientProvider for TanStack Query
- Sonner toast notifications
- AuthProvider for session management

**app/layout.tsx** - Root layout
- Metadata configuration
- Font setup (Geist Sans/Mono)
- Global styles imported
- Providers wrapper

**lib/api/client.ts** - API client
- Centralized HTTP client
- Base URL configuration
- Error handling and logging
- Auth header injection
- Credential inclusion for cookies

**lib/auth/auth-client.ts** - Better Auth client
- Client-side auth initialization
- Session management
- Sign up/in/out methods
- User session sync

**lib/auth/auth-provider.tsx** - Auth provider
- Session fetching on mount
- Redux dispatch for auth state
- useAuth hook for components
- Protected route handling

### Redux Setup

**lib/redux/store.ts** - Redux store
- Auth slice reducer
- UI slice reducer
- Middleware configuration

**lib/redux/slices/auth-slice.ts** - Auth state
- User data
- Session status
- Loading states

**lib/redux/slices/ui-slice.ts** - UI state
- Sidebar toggle
- Theme preference
- Notifications

**lib/redux/provider.tsx** - Provider component
- Wraps Redux store

### API Hooks (TanStack Query)

All hooks in `lib/hooks/`:
- `useGetUsers()` - Get user profile
- `useUpdateProfile()` - Update user
- `useGetTutors()` - List tutors
- `useSearchTutors()` - Search tutors
- `useGetTutorProfile()` - Get single tutor
- `useCreateTutorProfile()` - Create tutor profile
- `useUpdateTutorProfile()` - Update tutor profile
- `useCreateBooking()` - Create booking
- `useGetMyBookings()` - Get user bookings
- `useGetCategories()` - Get categories
- `useGetAvailability()` - Get tutor availability
- `useAddAvailability()` - Add availability slot

### Validation Schemas (Zod)

All in `lib/validations/`:

**auth.ts**
- `SignInSchema` - Email, password
- `SignUpSchema` - Name, email, password, role

**tutor.ts**
- `TutorProfileSchema` - Title, rate, categories, etc.
- `AvailabilitySchema` - Day, start/end time

**booking.ts**
- `BookingSchema` - Date, time, subject, notes

### Pages

**Landing Page** (`app/page.tsx`)
- Feature overview
- Call-to-action buttons
- Sign in/up navigation

**Auth Pages**
- `/auth/signin` - Login form
- `/auth/signup` - Registration form (student/tutor selection)

**Dashboard Pages**
- `/dashboard` - Overview and quick actions
- `/dashboard/profile` - Edit user profile
- `/dashboard/tutors` - Browse/search tutors
- `/dashboard/tutors/[id]` - View tutor, create booking
- `/dashboard/bookings` - Manage bookings
- `/dashboard/tutor/profile` - Create/edit tutor profile
- `/dashboard/availability` - Set availability schedule

### Components

**Auth Forms**
- `SignInForm` - Email/password login
- `SignUpForm` - Registration with role selection

**Tutor Components**
- `TutorCard` - Display tutor info with rating

**Booking Components**
- `BookingForm` - Date/time picker and submit
- `BookingCard` - Display booking status and details

**Layout Components**
- `Sidebar` - Navigation menu
- `Header` - User menu and notifications

## Environment Variables

**Frontend (.env.local)**

```env
# API endpoint for backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Better Auth server URL
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001

# Development environment
NODE_ENV=development
```

## Running Locally

```bash
# Terminal 1: Start Backend
cd ../skill-bridge-backend
npm run dev

# Terminal 2: Start Frontend
cd ../skill-bridge-frontend
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Key Architecture Decisions

1. **Better Auth** - Uses client SDK for auth
   - HTTP-only cookies (secure by default)
   - Session automatically sent with requests
   - No manual token management

2. **State Management**
   - Redux for UI state (sidebar, theme, notifications)
   - TanStack Query for server state (tutors, bookings)
   - Auth state synced between both

3. **API Client**
   - Centralized in `lib/api/client.ts`
   - Handles auth headers and credentials
   - Error handling and logging

4. **Form Handling**
   - TanStack Form for state management
   - Zod for validation
   - Real-time validation on change

5. **Modular Structure**
   - Components organized by feature
   - Hooks organized by resource
   - Validations grouped by form

## Deployment

### Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_BETTER_AUTH_URL=https://api.yourdomain.com`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t skill-bridge-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  skill-bridge-frontend
```

## Troubleshooting

**Build errors?**
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check TypeScript: `npx tsc --noEmit`

**Cookies not working?**
- Verify backend is running
- Check CORS on backend allows credentials
- In production, must use HTTPS
- Check browser privacy settings

**API calls failing?**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running on :3001
- Open DevTools > Network tab to inspect requests

**Auth not working?**
- Verify Better Auth is configured on backend
- Check session cookie in DevTools > Application
- Clear cookies and try again
- Verify `NEXT_PUBLIC_BETTER_AUTH_URL` matches backend

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint

# Useful debugging
npx next telemetry disable  # Disable telemetry
```

## Next Steps

1. **Set up backend** - Complete backend SETUP_GUIDE.md
2. **Clone frontend** - Follow installation steps above
3. **Run locally** - Start both services
4. **Explore features** - Test auth, tutors, bookings
5. **Deploy** - Use Vercel or Docker

## Reference

- **Backend Repo**: skill-bridge-backend
- **Frontend Repo**: skill-bridge-frontend
- **Docs**:
  - Next.js: https://nextjs.org
  - TanStack Query: https://tanstack.com/query
  - Better Auth: https://www.betterauth.dev
  - Zod: https://zod.dev
  - Redux: https://redux.js.org

---

**Ready!** Start with the Installation Steps above.
