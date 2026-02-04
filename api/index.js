// src/server/app.ts
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [
    "driverAdapters"
  ],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider        = "prisma-client"
  previewFeatures = ["driverAdapters"]
  output          = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ============================================
// BETTER AUTH TABLES
// ============================================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  emailVerified Boolean  @default(false)
  name          String?
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Role-based access control
  role   UserRole   @default(STUDENT)
  status UserStatus @default(ACTIVE)

  // Profile fields
  bio   String?
  phone String?

  // Better Auth relations
  accounts Account[]
  sessions Session[]

  // Application relations
  tutorProfile      TutorProfile?
  bookingsAsStudent Booking[]     @relation("StudentBookings")
  bookingsAsTutor   Booking[]     @relation("TutorBookings")
  reviews           Review[]

  @@index([email])
  @@index([role])
  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique // \u2705 REQUIRED by Better Auth
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("sessions")
}

model Account {
  id           String    @id @default(cuid())
  accountId    String
  providerId   String
  userId       String
  accessToken  String?   @db.Text
  refreshToken String?   @db.Text
  idToken      String?   @db.Text
  expiresAt    DateTime?
  password     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([providerId, accountId])
  @@index([userId])
  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
  @@map("verifications")
}

// ============================================
// APPLICATION TABLES
// ============================================

model TutorProfile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Tutor details
  title       String // e.g., "Math Expert", "Python Developer"
  headline    String? @db.Text // Short bio/tagline
  description String? @db.Text // Detailed description

  // Pricing
  hourlyRate Decimal @db.Decimal(10, 2)

  // Experience & Education
  experience Int     @default(0) // Years of experience
  education  String? @db.Text // Education background

  // Stats
  totalSessions Int      @default(0)
  averageRating Decimal? @db.Decimal(3, 2)
  totalReviews  Int      @default(0)

  // Status
  isAvailable Boolean @default(true)
  isVerified  Boolean @default(false)

  // Relations
  categories   TutorCategory[]
  availability Availability[]
  bookings     Booking[]       @relation("TutorBookings")
  reviews      Review[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([isAvailable])
  @@index([averageRating])
  @@map("tutor_profiles")
}

model Category {
  id          String  @id @default(cuid())
  name        String  @unique
  slug        String  @unique
  description String? @db.Text
  icon        String? // Icon name or URL
  color       String? // Hex color code

  isActive Boolean @default(true)

  tutors TutorCategory[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([isActive])
  @@map("categories")
}

// Junction table for Many-to-Many relationship
model TutorCategory {
  id         String @id @default(cuid())
  tutorId    String
  categoryId String

  tutor    TutorProfile @relation(fields: [tutorId], references: [id], onDelete: Cascade)
  category Category     @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  isPrimary Boolean @default(false) // Primary category for tutor

  createdAt DateTime @default(now())

  @@unique([tutorId, categoryId])
  @@index([tutorId])
  @@index([categoryId])
  @@map("tutor_categories")
}

model Availability {
  id      String       @id @default(cuid())
  tutorId String
  tutor   TutorProfile @relation(fields: [tutorId], references: [id], onDelete: Cascade)

  dayOfWeek DayOfWeek
  startTime String // Format: "HH:mm" (e.g., "09:00")
  endTime   String // Format: "HH:mm" (e.g., "17:00")

  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tutorId])
  @@index([dayOfWeek])
  @@map("availability")
}

model Booking {
  id String @id @default(cuid())

  // Student
  studentId String
  student   User   @relation("StudentBookings", fields: [studentId], references: [id], onDelete: Cascade)

  // Tutor
  tutorId        String
  tutor          User         @relation("TutorBookings", fields: [tutorId], references: [id], onDelete: Cascade)
  tutorProfile   TutorProfile @relation("TutorBookings", fields: [tutorProfileId], references: [id], onDelete: Cascade)
  tutorProfileId String

  // Session details
  subject     String
  sessionDate DateTime
  startTime   String // Format: "HH:mm"
  endTime     String // Format: "HH:mm"
  duration    Int // Duration in minutes

  // Pricing
  price Decimal @db.Decimal(10, 2)

  // Status
  status BookingStatus @default(PENDING)

  // Notes
  studentNotes String? @db.Text
  tutorNotes   String? @db.Text

  // Cancellation
  cancelledBy  String?
  cancelReason String?   @db.Text
  cancelledAt  DateTime?

  // Review
  review Review?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([studentId])
  @@index([tutorId])
  @@index([tutorProfileId])
  @@index([status])
  @@index([sessionDate])
  @@map("bookings")
}

model Review {
  id String @id @default(cuid())

  bookingId String  @unique
  booking   Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  studentId String
  student   User   @relation(fields: [studentId], references: [id], onDelete: Cascade)

  tutorId String
  tutor   TutorProfile @relation(fields: [tutorId], references: [id], onDelete: Cascade)

  rating  Int // 1-5 stars
  comment String? @db.Text

  // Tutor response
  response    String?   @db.Text
  respondedAt DateTime?

  isVisible Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([studentId])
  @@index([tutorId])
  @@index([rating])
  @@index([createdAt])
  @@map("reviews")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  STUDENT
  TUTOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  BANNED
  SUSPENDED
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum BookingStatus {
  PENDING // Awaiting tutor confirmation
  CONFIRMED // Tutor confirmed
  COMPLETED // Session completed
  CANCELLED // Cancelled by student or tutor
  NO_SHOW // Student didn't show up
}
`,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"name","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"bio","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookingsAsStudent","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"bookingsAsTutor","kind":"object","type":"Booking","relationName":"TutorBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"sessions"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"password","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"accounts"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verifications"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"title","kind":"scalar","type":"String"},{"name":"headline","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Decimal"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"education","kind":"scalar","type":"String"},{"name":"totalSessions","kind":"scalar","type":"Int"},{"name":"averageRating","kind":"scalar","type":"Decimal"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"categories","kind":"object","type":"TutorCategory","relationName":"TutorCategoryToTutorProfile"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfile"},{"name":"bookings","kind":"object","type":"Booking","relationName":"TutorBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"tutor_profiles"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"icon","kind":"scalar","type":"String"},{"name":"color","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"tutors","kind":"object","type":"TutorCategory","relationName":"CategoryToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"categories"},"TutorCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorCategoryToTutorProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorCategory"},{"name":"isPrimary","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"tutor_categories"},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"AvailabilityToTutorProfile"},{"name":"dayOfWeek","kind":"enum","type":"DayOfWeek"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"availability"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"User","relationName":"TutorBookings"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorBookings"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"sessionDate","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"duration","kind":"scalar","type":"Int"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"studentNotes","kind":"scalar","type":"String"},{"name":"tutorNotes","kind":"scalar","type":"String"},{"name":"cancelledBy","kind":"scalar","type":"String"},{"name":"cancelReason","kind":"scalar","type":"String"},{"name":"cancelledAt","kind":"scalar","type":"DateTime"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"bookings"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"response","kind":"scalar","type":"String"},{"name":"respondedAt","kind":"scalar","type":"DateTime"},{"name":"isVisible","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"reviews"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  // backend URL
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [
    process.env.APP_URL,
    // frontend URL
    "https://skill-bridge-fronted-production.up.railway.app"
    // Add explicitly
  ],
  // FIX: Remove crossSubDomainCookies since your frontend and backend are on different domains
  // crossSubDomainCookies is for subdomains like api.example.com and app.example.com
  // You're using vercel.app and railway.app which are different domains
  // ✅ CRITICAL: Configure cookies for cross-origin
  advanced: {
    cookies: {
      sessionToken: {
        name: "auth-token",
        options: {
          httpOnly: true,
          secure: true,
          // Required for production
          sameSite: "none",
          // ✅ Required for cross-domain
          path: "/",
          maxAge: 60 * 60 * 24 * 7
          // 7 days
        }
      }
    },
    useSecureCookies: true
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      role: { type: "string", required: true },
      status: { type: "string", required: false }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false
  }
});

// src/server/app.ts
var app = express();
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/.*\.railway\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(express.json());
app.all("/api/auth/*", toNodeHandler(auth));
var app_default = app;

// src/server/index.ts
var index_default = app_default;
export {
  index_default as default
};
