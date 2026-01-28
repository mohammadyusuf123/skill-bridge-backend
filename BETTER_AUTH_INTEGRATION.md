# Better Auth Integration Guide

This API is designed to work seamlessly with [Better Auth](https://www.better-auth.com/) for authentication. Better Auth handles user registration, login, session management, and OAuth providers.

## 🔐 Authentication Flow

### How It Works

1. **Better Auth** handles:
   - User registration and login
   - Session token generation
   - Password hashing
   - OAuth providers (Google, GitHub, etc.)
   - Email verification
   - Password reset

2. **This API** handles:
   - Session validation via session tokens
   - Role-based access control
   - Business logic (bookings, reviews, etc.)
   - User profile management

## 📋 Setup Instructions

### 1. Install Better Auth (Frontend)

In your frontend application:

```bash
npm install better-auth
```

### 2. Configure Better Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000", // Your Better Auth server URL
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### 3. Set Up Better Auth Server

Better Auth can be set up separately or integrated with this API. The database schema is already compatible.

```typescript
// lib/auth.ts (on your Better Auth server)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

## 🔑 Using Session Tokens with This API

### Frontend Example

```typescript
// Making authenticated requests
import { useSession } from "@/lib/auth-client";

function BookingComponent() {
  const { data: session } = useSession();

  const createBooking = async (bookingData: any) => {
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.session.token}` // Better Auth session token
      },
      body: JSON.stringify(bookingData)
    });

    return response.json();
  };

  return (
    // Your component JSX
  );
}
```

### How Authentication Works

1. User logs in via Better Auth
2. Better Auth creates a session and returns a session token
3. Frontend stores the session token
4. Frontend includes token in `Authorization: Bearer <token>` header
5. This API validates the token by:
   - Looking up the session in the database
   - Checking if session is expired
   - Checking if user is active
   - Extracting user info for role-based access control

## 📝 API Endpoints

### Authentication is handled by Better Auth

These endpoints are provided by Better Auth (not this API):

```typescript
// Register user
POST /api/auth/sign-up/email
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

// Login user
POST /api/auth/sign-in/email
{
  "email": "user@example.com",
  "password": "password123"
}

// OAuth login
GET /api/auth/sign-in/google
GET /api/auth/sign-in/github

// Sign out
POST /api/auth/sign-out

// Get session
GET /api/auth/get-session
```

### User Management (This API)

Once authenticated, use these endpoints:

```typescript
// Get current user profile
GET /api/users/profile
Authorization: Bearer <session_token>

// Update profile
PUT /api/users/profile
Authorization: Bearer <session_token>
{
  "name": "Updated Name",
  "bio": "My bio",
  "phone": "+1234567890"
}
```

## 🎯 Setting User Roles

### Option 1: During Registration (Frontend)

```typescript
// If Better Auth supports custom fields
const { data, error } = await signUp.email({
  email: "tutor@example.com",
  password: "password123",
  name: "Jane Smith",
  callbackURL: "/onboarding",
  data: {
    role: "TUTOR", // Custom field
  },
});
```

### Option 2: After Registration (API)

```typescript
// Admin endpoint to update user role
PATCH /api/users/:userId/role
Authorization: Bearer <admin_session_token>
{
  "role": "TUTOR"
}
```

### Option 3: Database Trigger

Create a database trigger to set default role:

```sql
-- Example: Set role based on email domain
CREATE OR REPLACE FUNCTION set_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email LIKE '%@tutors.com' THEN
    NEW.role := 'TUTOR';
  ELSE
    NEW.role := 'STUDENT';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_user_insert
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_role();
```

## 🔄 Complete User Flow

### Student Registration & Booking

```typescript
// 1. Register with Better Auth
const { data: authData } = await signUp.email({
  email: "student@example.com",
  password: "password123",
  name: "John Doe",
});

// 2. Session token is automatically available
const { data: session } = useSession();

// 3. Browse tutors (public endpoint)
const tutors = await fetch(
  "http://localhost:5000/api/tutors/search?categoryId=math",
);

// 4. Create booking (authenticated)
const booking = await fetch("http://localhost:5000/api/bookings", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${session.session.token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tutorId: "tutor_123",
    subject: "Calculus",
    sessionDate: "2024-02-15",
    startTime: "14:00",
    endTime: "15:30",
  }),
});
```

### Tutor Registration & Setup

```typescript
// 1. Register with Better Auth
const { data: authData } = await signUp.email({
  email: "tutor@example.com",
  password: "password123",
  name: "Jane Smith",
});

// 2. Update role to TUTOR (via admin or self-service)
// Admin does this, or use a separate onboarding flow

// 3. Create tutor profile
const profile = await fetch("http://localhost:5000/api/tutors/profile", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${session.session.token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Math Expert",
    hourlyRate: 50,
    categoryIds: ["cat_math"],
    experience: 10,
  }),
});

// 4. Set availability
const availability = await fetch(
  "http://localhost:5000/api/availability/bulk",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.session.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slots: [{ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" }],
    }),
  },
);
```

## 🛡️ Security Features

### Built-in Protection

1. **Session Expiration**: Better Auth handles session expiry
2. **Token Validation**: API validates session tokens on every request
3. **Role-Based Access**: Endpoints protected by user roles
4. **Account Status**: API checks if user is ACTIVE/BANNED/SUSPENDED

### Rate Limiting

The API includes rate limiting (100 requests per 15 minutes by default):

```typescript
// config/index.ts
rateLimit: {
  windowMs: 900000, // 15 minutes
  max: 100
}
```

## 🔧 Environment Variables

### Better Auth Server

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tutoring_db"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### This API

```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/tutoring_db"
CORS_ORIGIN="http://localhost:5173"
```

## 📚 Example Integration (React + Next.js)

### Protected Route Component

```typescript
// components/ProtectedRoute.tsx
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({
  children,
  requiredRole
}: {
  children: React.ReactNode;
  requiredRole?: 'STUDENT' | 'TUTOR' | 'ADMIN';
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }

    if (requiredRole && session?.user.role !== requiredRole) {
      router.push("/unauthorized");
    }
  }, [session, isPending, requiredRole, router]);

  if (isPending) return <div>Loading...</div>;
  if (!session) return null;

  return <>{children}</>;
}
```

### API Service Hook

```typescript
// hooks/useApi.ts
import { useSession } from "@/lib/auth-client";

export function useApi() {
  const { data: session } = useSession();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (session?.session.token) {
      headers["Authorization"] = `Bearer ${session.session.token}`;
    }

    const response = await fetch(`http://localhost:3001/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  };

  return { apiCall };
}
```

### Usage Example

```typescript
// app/dashboard/page.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { apiCall } = useApi();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const data = await apiCall(
        session?.user.role === 'TUTOR'
          ? '/dashboard/tutor'
          : '/dashboard/student'
      );
      setDashboard(data.data);
    };

    if (session) {
      fetchDashboard();
    }
  }, [session]);

  return (
    <div>
      <h1>Welcome, {session?.user.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

## 🚨 Troubleshooting

### Session Token Not Working

1. Check if token is being sent in headers
2. Verify session exists in database
3. Check if session has expired
4. Ensure user status is ACTIVE

### Role Issues

1. Verify user role in database
2. Check if role was set during registration
3. Use admin endpoint to update role if needed

### CORS Issues

Update CORS_ORIGIN in .env to match your frontend URL:

```env
CORS_ORIGIN="http://localhost:5173"
```

## 📖 Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Prisma Documentation](https://www.prisma.io/docs)
