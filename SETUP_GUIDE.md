# Skill Bridge - Complete Setup Guide

This guide walks through setting up both the frontend and backend for local development and deployment.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Backend Configuration](#backend-configuration)
3. [Frontend Configuration](#frontend-configuration)
4. [Running Locally](#running-locally)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

- Node.js 18+ or 20+ (recommended)
- PostgreSQL 12+ (for backend database)
- npm or yarn
- Git

### Project Structure

```
skill-bridge/
├── skill-bridge-backend/     # Backend API
└── skill-bridge-frontend/    # This frontend repo
```

## Backend Configuration

### 1. Clone and Setup Backend

```bash
git clone https://github.com/yourusername/skill-bridge-backend.git
cd skill-bridge-backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb skill_bridge_dev
```

### 3. Environment Variables

Create `.env` in backend root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skill_bridge_dev"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=your-secure-random-string-here

# Optional: Email configuration for notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Generate a secure random string for `BETTER_AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
# or
npx prisma migrate dev --name init
```

### 5. Seed Database (Optional)

```bash
npm run seed
```

### 6. Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:3001`

**Verify it's working:**
```bash
curl http://localhost:3001
# Should return: Welcome to Skill Bridge
```

## Frontend Configuration

### 1. Navigate to Frontend

```bash
cd ../skill-bridge-frontend
# or if you cloned this separately
git clone https://github.com/yourusername/skill-bridge-frontend.git
cd skill-bridge-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in frontend root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001

# Development
NODE_ENV=development
```

### 4. Verify Configuration

The frontend should be ready to go. All other configuration is pre-configured in:
- `next.config.mjs`
- `tailwind.config.ts`
- `tsconfig.json`

## Running Locally

### Start Both Services

**Terminal 1 - Backend:**
```bash
cd skill-bridge-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd skill-bridge-frontend
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: http://localhost:5555 (run `npx prisma studio`)

### Test the Setup

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create a test account
4. Select role (Student or Tutor)
5. Explore the dashboard

**For Tutors:**
1. Create tutor profile at /dashboard/tutor/profile
2. Set availability at /dashboard/availability
3. View student bookings

**For Students:**
1. Browse tutors at /dashboard/tutors
2. Create bookings with tutors
3. Manage bookings at /dashboard/bookings

## Production Deployment

### Backend Deployment (Vercel/Railway/Heroku)

#### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd skill-bridge-backend
vercel
```

Set environment variables in Vercel dashboard.

#### Option 2: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Frontend Deployment (Vercel)

```bash
# Vercel automatically detects Next.js
cd skill-bridge-frontend
vercel
```

Set environment variables:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://api.yourdomain.com
```

### Database Deployment

#### Option 1: Railway PostgreSQL

1. Create a new PostgreSQL database on Railway
2. Get connection string
3. Add to backend environment variables as `DATABASE_URL`

#### Option 2: AWS RDS

1. Create RDS PostgreSQL instance
2. Configure security groups
3. Add connection string to environment

#### Option 3: Supabase

1. Create Supabase project
2. Get PostgreSQL connection string
3. Update `DATABASE_URL` in backend

### Run Production Migrations

```bash
# On production server
DATABASE_URL=<production-url> npm run prisma:migrate
```

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│ (Next.js)       │
│ :3000           │
└────────┬────────┘
         │ HTTP/HTTPS
         │
┌─────────────────┐
│   Backend       │
│ (Express)       │
│ :3001           │
└────────┬────────┘
         │ TCP
         │
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘

Better Auth handles authentication
for both frontend and backend
```

## Authentication Flow

1. **Sign Up/In**
   - User fills form on frontend
   - Frontend sends to Better Auth API
   - Better Auth generates session cookie

2. **Session Management**
   - Cookie automatically sent with requests
   - AuthProvider keeps Redux state in sync
   - Protected routes check authentication

3. **API Calls**
   - Frontend sends requests with cookie
   - Backend validates session
   - Returns user data or error

## Data Flow Example: Create Booking

```
1. User fills booking form
   └─> Form validation (Zod)

2. User submits
   └─> TanStack Form submission handler

3. Frontend sends POST request
   └─> apiClient.post('/api/bookings', data)
   └─> Includes cookie automatically

4. Backend validates request
   └─> Checks session cookie
   └─> Validates input
   └─> Saves to database

5. Backend returns response
   └─> TanStack mutation catches response
   └─> Cache invalidated
   └─> UI updated
   └─> Toast notification shown
```

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| DATABASE_URL | Yes | postgresql://... | Database connection |
| PORT | No | 3001 | Server port |
| NODE_ENV | No | development | Environment |
| APP_URL | Yes | http://localhost:3000 | Frontend URL for CORS |
| BETTER_AUTH_URL | Yes | http://localhost:3001 | Auth server URL |
| BETTER_AUTH_SECRET | Yes | random-string | Auth secret |

### Frontend (.env.local)

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| NEXT_PUBLIC_API_URL | Yes | http://localhost:3001 | Backend API URL |
| NEXT_PUBLIC_BETTER_AUTH_URL | Yes | http://localhost:3001 | Better Auth URL |

## Troubleshooting

### Backend Won't Start

```
Error: Cannot find module 'express'
→ Run: npm install

Error: ECONNREFUSED at localhost:5432
→ PostgreSQL not running. Start with: pg_ctl start

Error: Database migration failed
→ Check DATABASE_URL. Run: npm run prisma:migrate
```

### Frontend Won't Connect to Backend

```
Error: Failed to fetch
→ Check if backend is running on :3001
→ Verify NEXT_PUBLIC_API_URL in .env.local
→ Check CORS settings on backend

Error: Cookies not sent with requests
→ Verify credentials: 'include' in API client
→ Check backend allows credentials
→ HTTPS required in production
```

### Authentication Issues

```
Error: Session not found
→ Check Better Auth configuration
→ Verify BETTER_AUTH_SECRET is set
→ Clear browser cookies and try again

Error: CORS error on login
→ Verify APP_URL matches frontend URL in backend .env
→ Check backend CORS configuration

User logged out after page reload
→ Check AuthProvider initialization
→ Verify Redux store is set up
→ Check cookie settings (production requires HTTPS)
```

### Database Issues

```
Error: Cannot connect to database
→ Verify DATABASE_URL is correct
→ Check PostgreSQL is running
→ Verify database exists

Error: Migration failed
→ Check migration file for syntax errors
→ Ensure database user has permissions
→ Run: npm run prisma:reset (warns before deletion)
```

### Build/Deployment Issues

```
Error: Build failed on Vercel
→ Check all environment variables are set
→ Verify dependencies are in package.json
→ Check for TypeScript errors locally first

Error: 404 on deployed frontend
→ Verify production API URL is correct
→ Check if backend is deployed
→ Verify frontend build is recent
```

## Common Commands

### Development

```bash
# Start backend
npm run dev                  # in backend/

# Start frontend
npm run dev                  # in frontend/

# View database
npx prisma studio

# Check logs
tail -f logs/app.log
```

### Database

```bash
# Create migration
npm run prisma:migrate -- --name migration_name

# Reset database (⚠️ deletes all data)
npm run prisma:reset

# Generate Prisma client
npm run prisma:generate

# View schema
npx prisma studio
```

### Deployment

```bash
# Build frontend
npm run build

# Start production
npm start

# Deploy to Vercel
vercel --prod

# Deploy to Railway
railway up
```

### Debugging

```bash
# Enable debug logs (backend)
DEBUG=* npm run dev

# Check API response
curl -H "Cookie: better-auth.session=..." http://localhost:3001/api/users/profile

# Check frontend network traffic
# Open DevTools > Network tab in browser

# Check Redux state
# Install Redux DevTools extension in browser
```

## Next Steps

1. **Local Development**: Complete the [Local Development Setup](#local-development-setup)
2. **Feature Development**: Read `README.md` for architecture details
3. **Deployment**: Follow [Production Deployment](#production-deployment) when ready
4. **Monitoring**: Set up error tracking (Sentry) and analytics (Vercel Analytics)

## Additional Resources

- **Backend Repository**: skill-bridge-backend
- **Better Auth Docs**: https://www.betterauth.dev
- **Next.js Docs**: https://nextjs.org
- **Prisma Docs**: https://www.prisma.io
- **TanStack Query**: https://tanstack.com/query

## Support

For issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Check console logs and error messages
3. Verify all environment variables are set
4. Check that both services are running
5. Clear browser cache and cookies

---

**Ready to go!** Start with the [Running Locally](#running-locally) section.
