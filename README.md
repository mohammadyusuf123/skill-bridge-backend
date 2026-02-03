# Skill Bridge Frontend

A modern, production-ready Next.js frontend for the Skill Bridge tutoring platform. Built with TypeScript, Tailwind CSS, TanStack Query, Redux, and Better Auth for seamless authentication.

## Features

- **Secure Authentication** - Better Auth integration with HTTP-only cookies
- **Modular Architecture** - Well-organized components and utilities for scalability
- **Type Safety** - Full TypeScript support with Zod validation schemas
- **State Management** - Redux for global state + TanStack Query for server state
- **Form Handling** - TanStack Form with comprehensive validation
- **Responsive Design** - Mobile-first Tailwind CSS styling
- **API Integration** - Centralized API client with error handling
- **User Features** - Authentication, profile management, tutor search, booking system
- **Tutor Features** - Profile creation, availability management, student bookings
- **Real-time Updates** - TanStack Query for automatic cache invalidation
- **Production Ready** - Deployment guides and security best practices included

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Redux Toolkit + React Redux |
| Data Fetching | TanStack Query v5 |
| Forms | TanStack Form + Zod |
| Auth | Better Auth |
| HTTP | Native Fetch API |

## Project Structure

```
skill-bridge-frontend/
├── app/                              # Next.js App Router
│   ├── auth/                         # Authentication routes
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/                    # Protected routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/page.tsx
│   │   ├── tutors/
│   │   ├── bookings/
│   │   ├── tutor/
│   │   └── availability/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   ├── error.tsx                     # Error boundary
│   ├── not-found.tsx                 # 404 page
│   └── globals.css                   # Global styles
├── components/                       # Reusable components
│   ├── auth/                         # Auth forms
│   ├── bookings/                     # Booking UI
│   ├── layout/                       # Layout components
│   ├── tutors/                       # Tutor cards
│   └── ui/                           # Utility components
├── lib/                              # Core utilities
│   ├── api/                          # API client
│   ├── auth/                         # Auth setup
│   ├── hooks/                        # TanStack Query hooks
│   ├── redux/                        # Redux store
│   ├── validations/                  # Zod schemas
│   └── utils.ts
├── types/                            # TypeScript types
├── providers.tsx                     # Root providers
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- Backend API running on `http://localhost:3001`

### Installation

```bash
# Clone repository
git clone <repository-url>
cd skill-bridge-frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Update .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Architecture Highlights

### Authentication Flow

1. User signs up/in via `/auth/signup` or `/auth/signin`
2. Better Auth issues HTTP-only cookie
3. `AuthProvider` fetches session and syncs with Redux
4. Protected routes via `useAuth()` hook
5. API client automatically includes cookies

### State Management

- **Global UI State**: Redux (sidebar, theme, notifications)
- **Auth State**: Redux + AuthProvider sync
- **Server State**: TanStack Query (tutors, bookings, profiles)
- **Form State**: TanStack Form with real-time validation

### API Integration

- Centralized `apiClient` in `lib/api/client.ts`
- Custom hooks for each resource (users, tutors, bookings, etc.)
- Automatic cache invalidation after mutations
- Standardized error handling and notifications

### Cookie Configuration

Better Auth is configured for production deployment:

```typescript
// Secure cookies in production
fetchOptions: { credentials: 'include' }
advanced: {
  useSecureCookies: NODE_ENV === 'production',
  cookiePrefix: 'better-auth',
  crossSubDomainCookies: { enabled: false },
}
```

## Key Pages

### Public Pages
- `/` - Landing page with feature overview
- `/auth/signin` - User login
- `/auth/signup` - User registration

### Protected Pages (Authenticated Users)
- `/dashboard` - Main dashboard
- `/dashboard/profile` - Edit user profile
- `/dashboard/tutors` - Search and browse tutors
- `/dashboard/tutors/[id]` - Tutor profile & booking
- `/dashboard/bookings` - Manage bookings

### Tutor-Only Pages
- `/dashboard/tutor/profile` - Create/edit tutor profile
- `/dashboard/availability` - Manage availability

## API Integration

All endpoints match the backend API:

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Tutor Endpoints
- `GET /api/tutors` - List all tutors
- `GET /api/tutors/search` - Search tutors
- `POST /api/tutors/profile` - Create profile
- `PUT /api/tutors/profile` - Update profile

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/cancel` - Cancel booking

See `DEPLOYMENT.md` for full endpoint documentation.

## Development Guidelines

### Adding a Page

1. Create route in `app/` following Next.js conventions
2. Add supporting components in `components/`
3. Create TanStack Query hooks in `lib/hooks/` if needed
4. Add validation schema in `lib/validations/`

### Creating an API Hook

```typescript
// lib/hooks/use-resource.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useGetResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/resource/${id}`)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
  })
}
```

### Form Validation

```typescript
// lib/validations/form.ts
import { z } from 'zod'

export const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

export type Input = z.infer<typeof schema>
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
3. Deploy with `git push`

### Docker

```bash
docker build -t skill-bridge-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  skill-bridge-frontend
```

See `DEPLOYMENT.md` for detailed deployment guides, scaling considerations, and troubleshooting.

## Error Handling

All errors are caught and displayed as toast notifications. The API client ensures consistent error formatting:

```typescript
// Automatic error handling
try {
  await mutation.mutateAsync(data)
} catch (error: any) {
  dispatch(addNotification({
    type: 'error',
    message: error.message || 'An error occurred'
  }))
}
```

## Performance Optimization

- **Code Splitting**: Automatic per-route and per-component
- **Image Optimization**: Next.js image component (if added)
- **Caching**: 5-minute stale time for server state
- **Tree Shaking**: Unused code removed in production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
NODE_ENV=development
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Security

- ✅ HTTPS-only cookies in production
- ✅ HTTP-only cookie flag (server-set)
- ✅ CORS credentials properly configured
- ✅ Zod input validation
- ✅ XSS protection (Next.js)
- ✅ CSRF protection (Better Auth)

## Troubleshooting

**Cookies not working?**
- Verify HTTPS in production
- Check backend CORS configuration
- Ensure `credentials: 'include'` in API calls

**Session lost on reload?**
- Check AuthProvider is at app root
- Verify useSession hook initialization
- Check Redux store setup

**Form validation failing?**
- Verify Zod schema is imported
- Check TanStack Form setup
- Review error messages in console

## Contributing

Follow the modular architecture pattern. Keep components focused and single-responsibility.

## Support & Documentation

- See `DEPLOYMENT.md` for deployment guide
- Backend API docs in backend repository
- Better Auth docs: [betterauth.dev](https://www.betterauth.dev)
- Next.js docs: [nextjs.org](https://nextjs.org)

## License

Proprietary - Skill Bridge

## Author

Mohammad Yusuf (Backend)
Frontend built with modern Next.js best practices
