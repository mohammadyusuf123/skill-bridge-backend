# SkillBridge Platform REST API

A comprehensive REST API built with **Express.js**, **TypeScript**, and **Prisma ORM** for a tutoring platform. This API follows a modular architecture pattern and integrates seamlessly with **Better Auth** for authentication.

## 🚀 Features

- **Better Auth Integration** - Uses Better Auth for user authentication and session management
- **User Authentication** - Session-based authentication with role-based access control (STUDENT, TUTOR, ADMIN)
- **Tutor Profiles** - Create and manage tutor profiles with categories and availability
- **Booking System** - Instant booking confirmation, manage bookings, track status
- **Review System** - Students can review tutors, tutors can respond
- **Category Management** - Organize tutors by categories/subjects
- **Availability Management** - Tutors can set their weekly availability
- **Dashboard Analytics** - Role-specific dashboards with statistics and insights
  - Student Dashboard: Bookings overview, favorite tutors, spending stats
  - Tutor Dashboard: Session stats, earnings, upcoming sessions, reviews
  - Admin Dashboard: Platform statistics, user management, revenue tracking
- **Admin Panel** - Admin endpoints for user and content management
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Centralized error handling
- **Database Migrations** - Prisma migrations for schema changes
- **Complete User Journeys** - Documented workflows for students, tutors, and admins

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Better Auth setup (for authentication)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd tutoring-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="postgresql://username:password@localhost:5432/tutoring_db"
   CORS_ORIGIN=http://localhost:5173
   ```

   **Note**: Authentication is handled by Better Auth. See `BETTER_AUTH_INTEGRATION.md` for setup instructions.

4. **Generate Prisma client**

   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**

   ```bash
   npm run prisma:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be running at `http://localhost:5000`

## 🔌 API Endpoints

### Authentication

**Note**: Authentication endpoints (register, login, OAuth) are handled by Better Auth, not this API.

See [BETTER_AUTH_INTEGRATION.md](BETTER_AUTH_INTEGRATION.md) for authentication setup.

### Users

#### Get Current User Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "I love learning!",
  "phone": "+1234567890"
}
```

### Tutors

#### Create Tutor Profile

```http
POST /api/tutors/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Math Expert",
  "headline": "10+ years of teaching experience",
  "description": "Specialized in calculus and algebra",
  "hourlyRate": 50.00,
  "experience": 10,
  "education": "PhD in Mathematics",
  "categoryIds": ["category_id_1", "category_id_2"]
}
```

#### Search Tutors

```http
GET /api/tutors/search?page=1&limit=10&categoryId=xxx&minRate=20&maxRate=100&minRating=4&search=math
```

#### Get Tutor Profile

```http
GET /api/tutors/:tutorId
```

#### Update Tutor Profile

```http
PUT /api/tutors/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "hourlyRate": 60.00,
  "isAvailable": true
}
```

### Bookings

#### Create Booking

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "tutorId": "tutor_user_id",
  "subject": "Calculus Help",
  "sessionDate": "2024-02-15",
  "startTime": "14:00",
  "endTime": "15:30",
  "studentNotes": "Need help with derivatives"
}
```

#### Get My Bookings

```http
GET /api/bookings/my-bookings?page=1&limit=10&status=PENDING
Authorization: Bearer <token>
```

#### Get Booking by ID

```http
GET /api/bookings/:bookingId
Authorization: Bearer <token>
```

#### Update Booking Status

```http
PUT /api/bookings/:bookingId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "tutorNotes": "Looking forward to the session"
}
```

#### Cancel Booking

```http
POST /api/bookings/:bookingId/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Schedule conflict"
}
```

#### Get Booking Stats

```http
GET /api/bookings/stats
Authorization: Bearer <token>
```

### Reviews

#### Create Review

```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking_id",
  "rating": 5,
  "comment": "Excellent tutor! Very helpful."
}
```

#### Get Tutor Reviews

```http
GET /api/reviews/tutor/:tutorId?page=1&limit=10
```

#### Respond to Review (Tutor)

```http
POST /api/reviews/:reviewId/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "Thank you for the kind words!"
}
```

### Categories

#### Get All Categories

```http
GET /api/categories
```

#### Create Category (Admin)

```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mathematics",
  "slug": "mathematics",
  "description": "Math subjects",
  "icon": "calculator",
  "color": "#FF5733"
}
```

#### Update Category (Admin)

```http
PUT /api/categories/:categoryId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Advanced Mathematics",
  "isActive": true
}
```

### Availability

#### Add Availability (Tutor)

```http
POST /api/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "17:00"
}
```

#### Get Tutor Availability

```http
GET /api/availability/tutor/:tutorId
```

#### Bulk Add Availability (Tutor)

```http
POST /api/availability/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "slots": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    {
      "dayOfWeek": "TUESDAY",
      "startTime": "14:00",
      "endTime": "18:00"
    }
  ]
}
```

### Dashboards

#### Get Student Dashboard

```http
GET /api/dashboard/student
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBookings": 5,
      "completedSessions": 3,
      "pendingSessions": 0,
      "totalSpent": 225.00
    },
    "upcomingBookings": [...],
    "recentBookings": [...],
    "favoriteTutors": [...]
  }
}
```

#### Get Tutor Dashboard

```http
GET /api/dashboard/tutor
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSessions": 25,
      "completedSessions": 20,
      "pendingSessions": 2,
      "totalEarnings": 1250.00,
      "thisMonthEarnings": 350.00,
      "studentsCount": 12,
      "averageRating": 4.85,
      "totalReviews": 18
    },
    "upcomingSessions": [...],
    "recentSessions": [...],
    "recentReviews": [...]
  }
}
```

#### Get Admin Dashboard

```http
GET /api/dashboard/admin
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalTutors": 45,
      "totalStudents": 100,
      "totalBookings": 320,
      "totalRevenue": 14250.00,
      "bookingGrowth": 15.5
    },
    "recentUsers": [...],
    "recentBookings": [...],
    "topTutors": [...]
  }
}
```

#### Get Booking Statistics

```http
GET /api/dashboard/stats?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

## 🔐 Authentication

This API integrates with **Better Auth** for authentication. Better Auth handles user registration, login, OAuth providers, and session management.

**How it works:**

1. User authenticates via Better Auth
2. Better Auth generates a session token
3. Frontend includes token in requests: `Authorization: Bearer <session_token>`
4. This API validates the session token from the database

For detailed integration instructions, see **[BETTER_AUTH_INTEGRATION.md](BETTER_AUTH_INTEGRATION.md)**

**Example request with authentication:**

```bash
curl -H "Authorization: Bearer <session_token>" http://localhost:5000/api/users/profile
```

## 📊 Booking Status Flow

The platform uses **instant confirmation** for bookings:

```
CONFIRMED (instant) → COMPLETED (by tutor) or CANCELLED (by student/tutor)
```

**Status Descriptions:**

- **CONFIRMED**: Booking is instantly confirmed when created
- **COMPLETED**: Tutor marks the session as complete after it happens
- **CANCELLED**: Either student or tutor can cancel the booking

**Status Transitions:**

- Student books → Status: **CONFIRMED** (instant)
- After session → Tutor marks: **COMPLETED**
- Anytime before session → Can cancel: **CANCELLED**
- After **COMPLETED** → Student can leave review

## 👥 User Roles

- **STUDENT** - Can book sessions, write reviews
- **TUTOR** - Can create profile, manage availability, receive bookings
- **ADMIN** - Full access to all resources

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## 🧪 Testing

```bash
npm test
```

## 🏗️ Database Schema

The database includes the following main tables:

- **users** - User accounts
- **sessions** - User sessions
- **accounts** - OAuth and credential accounts
- **tutor_profiles** - Tutor information
- **categories** - Subject categories
- **tutor_categories** - Many-to-many relation
- **availability** - Tutor availability slots
- **bookings** - Session bookings
- **reviews** - Tutor reviews

## 🔄 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Development

- typescript - Type safety
- tsx - TypeScript execution
- prisma - Database toolkit
- eslint - Code linting
- prettier - Code formatting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

Mohammad Yusuf

## 🙏 Acknowledgments

- Prisma for the excellent ORM
- Express.js community
- TypeScript team
