# User Journeys & Workflows

Complete user journey documentation for the Tutoring Platform API.

## 📱 Frontend Routes Mapping

### Student Routes (Private - Requires Authentication)

| Route | Page | API Endpoints Used | Description |
|-------|------|-------------------|-------------|
| `/dashboard` | Dashboard | `GET /api/dashboard/student` | Overview, upcoming bookings, stats |
| `/dashboard/bookings` | My Bookings | `GET /api/bookings/my-bookings` | Booking history and management |
| `/dashboard/profile` | Profile | `GET /api/users/profile`<br>`PUT /api/users/profile` | View and edit student info |

### Tutor Routes (Private - Requires Authentication)

| Route | Page | API Endpoints Used | Description |
|-------|------|-------------------|-------------|
| `/tutor/dashboard` | Dashboard | `GET /api/dashboard/tutor` | Sessions overview, stats, earnings |
| `/tutor/availability` | Availability | `GET /api/availability/me`<br>`POST /api/availability`<br>`POST /api/availability/bulk` | Set and manage time slots |
| `/tutor/profile` | Profile | `GET /api/tutors/profile/me`<br>`PUT /api/tutors/profile` | Edit tutor profile and settings |

### Admin Routes (Private - Requires Admin Role)

| Route | Page | API Endpoints Used | Description |
|-------|------|-------------------|-------------|
| `/admin` | Dashboard | `GET /api/dashboard/admin` | Platform statistics and overview |
| `/admin/users` | Users | `GET /api/users` | Manage all users |
| `/admin/bookings` | Bookings | `GET /api/bookings/my-bookings` | View all platform bookings |
| `/admin/categories` | Categories | `GET /api/categories`<br>`POST /api/categories`<br>`PUT /api/categories/:id` | Manage categories |

---

## 👨‍🎓 Student Journey

```
┌──────────────┐
│   Register   │  POST /api/auth/sign-up/email (Better Auth)
│              │  Body: { email, password, name }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Browse Tutors │  GET /api/tutors/search
│              │  Query: ?categoryId=xxx&minRating=4&page=1
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ View Profile │  GET /api/tutors/:tutorId
│              │  GET /api/reviews/tutor/:tutorId
│              │  GET /api/availability/tutor/:tutorId
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Book Session │  POST /api/bookings
│              │  Body: { tutorId, subject, sessionDate, startTime, endTime }
│              │  Status: CONFIRMED (instant)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Attend    │  Session happens in real life/video call
│              │  Tutor marks complete: POST /api/bookings/:id/complete
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Leave Review │  POST /api/reviews
│              │  Body: { bookingId, rating, comment }
└──────────────┘
```

### Student API Flow Examples

#### 1. Register and Login (via Better Auth)
```bash
# Register via Better Auth
POST /api/auth/sign-up/email  # Better Auth endpoint
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe"
}
Response: { user, session: { token, expiresAt } }

# Login (if already registered)
POST /api/auth/sign-in/email  # Better Auth endpoint
{
  "email": "student@example.com",
  "password": "password123"
}
Response: { user, session: { token, expiresAt } }

# OAuth Login (optional)
GET /api/auth/sign-in/google  # Better Auth endpoint
GET /api/auth/sign-in/github  # Better Auth endpoint
```

**Note**: Authentication is handled by Better Auth. This API validates the session tokens.

#### 2. Browse and Search Tutors
```bash
# Get all categories first
GET /api/categories

# Search tutors
GET /api/tutors/search?categoryId=math&minRating=4&page=1&limit=10&sortBy=averageRating

# View specific tutor
GET /api/tutors/user_123

# Check tutor's reviews
GET /api/reviews/tutor/tutor_profile_123

# Check tutor's availability
GET /api/availability/tutor/user_123
```

#### 3. Book a Session
```bash
POST /api/bookings
Authorization: Bearer <student_token>
{
  "tutorId": "user_123",
  "subject": "Calculus - Derivatives",
  "sessionDate": "2024-02-15",
  "startTime": "14:00",
  "endTime": "15:30",
  "studentNotes": "Need help with chain rule"
}
Response: Booking with status "CONFIRMED"
```

#### 4. View Dashboard
```bash
GET /api/dashboard/student
Authorization: Bearer <student_token>

Response:
{
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
```

#### 5. Manage Bookings
```bash
# View all bookings
GET /api/bookings/my-bookings?page=1&limit=10
Authorization: Bearer <student_token>

# Cancel a booking
POST /api/bookings/:bookingId/cancel
Authorization: Bearer <student_token>
{
  "reason": "Schedule conflict"
}
```

#### 6. Leave Review (After Session Completion)
```bash
POST /api/reviews
Authorization: Bearer <student_token>
{
  "bookingId": "booking_123",
  "rating": 5,
  "comment": "Excellent tutor! Very patient and knowledgeable."
}
```

---

## 👨‍🏫 Tutor Journey

```
┌──────────────┐
│   Register   │  POST /api/auth/sign-up/email (Better Auth)
│              │  Body: { email, password, name }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Create Profile│  POST /api/tutors/profile
│              │  Body: { title, hourlyRate, categoryIds, ... }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Set       │  POST /api/availability/bulk
│ Availability │  Body: { slots: [{ dayOfWeek, startTime, endTime }] }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│View Sessions │  GET /api/dashboard/tutor
│              │  GET /api/bookings/my-bookings
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Mark Complete │  POST /api/bookings/:id/complete
│              │  Body: { tutorNotes: "Great session!" }
└──────────────┘
```

### Tutor API Flow Examples

#### 1. Register and Create Profile (via Better Auth)
```bash
# Register as tutor via Better Auth
POST /api/auth/sign-up/email  # Better Auth endpoint
{
  "email": "tutor@example.com",
  "password": "password123",
  "name": "Jane Smith"
}

# Set role to TUTOR (via admin or during onboarding)
PATCH /api/users/user_123/role
Authorization: Bearer <admin_token>
{
  "role": "TUTOR"
}

# Create tutor profile
POST /api/tutors/profile
Authorization: Bearer <tutor_session_token>
{
  "title": "Mathematics Expert",
  "headline": "10+ years teaching calculus",
  "description": "PhD in Mathematics, specialized in advanced calculus",
  "hourlyRate": 50.00,
  "experience": 10,
  "education": "PhD in Mathematics - MIT",
  "categoryIds": ["cat_math_123"]
}
```

#### 2. Set Availability
```bash
# Add single slot
POST /api/availability
Authorization: Bearer <tutor_token>
{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "17:00"
}

# Bulk add availability
POST /api/availability/bulk
Authorization: Bearer <tutor_token>
{
  "slots": [
    { "dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "12:00" },
    { "dayOfWeek": "MONDAY", "startTime": "14:00", "endTime": "18:00" },
    { "dayOfWeek": "WEDNESDAY", "startTime": "10:00", "endTime": "16:00" },
    { "dayOfWeek": "FRIDAY", "startTime": "09:00", "endTime": "15:00" }
  ]
}
```

#### 3. View Tutor Dashboard
```bash
GET /api/dashboard/tutor
Authorization: Bearer <tutor_token>

Response:
{
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
```

#### 4. Manage Sessions
```bash
# View all bookings
GET /api/bookings/my-bookings?status=CONFIRMED
Authorization: Bearer <tutor_token>

# Mark session as complete
POST /api/bookings/booking_123/complete
Authorization: Bearer <tutor_token>
{
  "tutorNotes": "Great session! Student grasped the concepts well."
}
```

#### 5. Respond to Reviews
```bash
POST /api/reviews/review_123/respond
Authorization: Bearer <tutor_token>
{
  "response": "Thank you for the kind words! It was a pleasure working with you."
}
```

#### 6. Toggle Availability
```bash
# Toggle overall availability (taking a break)
PATCH /api/tutors/availability/toggle
Authorization: Bearer <tutor_token>
```

---

## 📊 Booking Status Flow

```
                    ┌──────────────┐
                    │  CONFIRMED   │ ◄── Instant confirmation when created
                    │   (instant)  │
                    └──────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
       (tutor marks                  (student/tutor
        complete)                     cancels)
            │                             │
            ▼                             ▼
    ┌──────────────┐              ┌──────────────┐
    │  COMPLETED   │              │  CANCELLED   │
    │              │              │              │
    └──────────────┘              └──────────────┘
            │
            │ (student can now)
            ▼
    ┌──────────────┐
    │ Leave Review │
    └──────────────┘
```

### Status Transitions

| From Status | To Status | Who Can Transition | Endpoint |
|-------------|-----------|-------------------|----------|
| CONFIRMED | COMPLETED | Tutor only | `POST /api/bookings/:id/complete` |
| CONFIRMED | CANCELLED | Student or Tutor | `POST /api/bookings/:id/cancel` |
| COMPLETED | (Review) | Student only | `POST /api/reviews` |

---

## 🔐 Admin Journey

### Admin API Flow Examples

#### 1. View Admin Dashboard
```bash
GET /api/dashboard/admin
Authorization: Bearer <admin_token>

Response:
{
  "overview": {
    "totalUsers": 150,
    "totalTutors": 45,
    "totalStudents": 100,
    "totalBookings": 320,
    "completedBookings": 280,
    "totalRevenue": 14250.00,
    "thisMonthRevenue": 2500.00,
    "bookingGrowth": 15.5
  },
  "recentUsers": [...],
  "recentBookings": [...],
  "topTutors": [...]
}
```

#### 2. Manage Users
```bash
# Get all users with filters
GET /api/users?role=TUTOR&status=ACTIVE&page=1&limit=20
Authorization: Bearer <admin_token>

# Delete user
DELETE /api/users/user_123
Authorization: Bearer <admin_token>
```

#### 3. Manage Categories
```bash
# Create category
POST /api/categories
Authorization: Bearer <admin_token>
{
  "name": "Programming",
  "slug": "programming",
  "description": "Web dev, mobile apps, data science",
  "icon": "code",
  "color": "#3498db"
}

# Update category
PUT /api/categories/cat_123
Authorization: Bearer <admin_token>
{
  "isActive": false
}
```

#### 4. View All Bookings
```bash
GET /api/bookings/my-bookings?page=1&limit=50
Authorization: Bearer <admin_token>
```

#### 5. Delete Inappropriate Reviews
```bash
DELETE /api/reviews/review_123
Authorization: Bearer <admin_token>
```

---

## 🔄 Complete User Flow Summary

### Student Complete Flow
1. **Register** → `POST /api/users/register`
2. **Browse Tutors** → `GET /api/tutors/search`
3. **View Profile** → `GET /api/tutors/:id`
4. **Book Session** → `POST /api/bookings` (instant CONFIRMED)
5. **Attend Session** → (offline/video call)
6. **Wait for Completion** → Tutor marks: `POST /api/bookings/:id/complete`
7. **Leave Review** → `POST /api/reviews`
8. **View Dashboard** → `GET /api/dashboard/student`

### Tutor Complete Flow
1. **Register** → `POST /api/users/register`
2. **Create Profile** → `POST /api/tutors/profile`
3. **Set Availability** → `POST /api/availability/bulk`
4. **Receive Bookings** → Students book automatically (CONFIRMED)
5. **View Sessions** → `GET /api/dashboard/tutor`
6. **Complete Session** → `POST /api/bookings/:id/complete`
7. **Respond to Reviews** → `POST /api/reviews/:id/respond`

---

## 📱 Key Differences from Traditional Booking

### Instant Confirmation
- **Traditional**: Student books → Status: PENDING → Tutor confirms → Status: CONFIRMED
- **This Platform**: Student books → Status: CONFIRMED (instant)

### Benefits
1. **Faster booking process** - No waiting for tutor approval
2. **Better user experience** - Immediate confirmation
3. **Simpler workflow** - Fewer status transitions
4. **Clear expectations** - Students know immediately if booking succeeded

### Cancellation Policy
Both students and tutors can cancel CONFIRMED bookings:
- Use `POST /api/bookings/:id/cancel` with a reason
- Status changes to CANCELLED
- Can implement cancellation fees/policies in frontend

---

## 🎯 Integration Tips for Frontend

### Authentication
```javascript
// Store token after login/register
localStorage.setItem('token', response.data.token);

// Add to all requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Role-Based Routing
```javascript
// Protect routes based on user role
if (user.role === 'STUDENT') {
  // Show student dashboard
  navigate('/dashboard');
} else if (user.role === 'TUTOR') {
  // Show tutor dashboard
  navigate('/tutor/dashboard');
} else if (user.role === 'ADMIN') {
  // Show admin dashboard
  navigate('/admin');
}
```

### Real-time Updates (Optional)
Consider implementing WebSockets or polling for:
- New booking notifications
- Session reminders
- Review notifications
- Admin alerts
