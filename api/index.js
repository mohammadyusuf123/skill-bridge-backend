var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
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
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AvailabilityScalarFieldEnum: () => AvailabilityScalarFieldEnum,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorCategoryScalarFieldEnum: () => TutorCategoryScalarFieldEnum,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  TutorProfile: "TutorProfile",
  Category: "Category",
  TutorCategory: "TutorCategory",
  Availability: "Availability",
  Booking: "Booking",
  Review: "Review"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  email: "email",
  emailVerified: "emailVerified",
  name: "name",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status",
  bio: "bio",
  phone: "phone"
};
var SessionScalarFieldEnum = {
  id: "id",
  token: "token",
  expiresAt: "expiresAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  expiresAt: "expiresAt",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  title: "title",
  headline: "headline",
  description: "description",
  hourlyRate: "hourlyRate",
  experience: "experience",
  education: "education",
  totalSessions: "totalSessions",
  averageRating: "averageRating",
  totalReviews: "totalReviews",
  isAvailable: "isAvailable",
  isVerified: "isVerified",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  icon: "icon",
  color: "color",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorCategoryScalarFieldEnum = {
  id: "id",
  tutorId: "tutorId",
  categoryId: "categoryId",
  isPrimary: "isPrimary",
  createdAt: "createdAt"
};
var AvailabilityScalarFieldEnum = {
  id: "id",
  tutorId: "tutorId",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorId: "tutorId",
  tutorProfileId: "tutorProfileId",
  subject: "subject",
  sessionDate: "sessionDate",
  startTime: "startTime",
  endTime: "endTime",
  duration: "duration",
  price: "price",
  status: "status",
  studentNotes: "studentNotes",
  tutorNotes: "tutorNotes",
  cancelledBy: "cancelledBy",
  cancelReason: "cancelReason",
  cancelledAt: "cancelledAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorId: "tutorId",
  rating: "rating",
  comment: "comment",
  response: "response",
  respondedAt: "respondedAt",
  isVisible: "isVisible",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
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
    process.env.APP_URL
    // frontend URL
  ],
  advanced: {
    cookies: {
      sessionToken: {
        name: "better-auth.session",
        attributes: {
          httpOnly: true,
          secure: true,
          // ✅ REQUIRED on Vercel
          sameSite: "lax",
          // ✅ Same-origin, so "lax" works
          path: "/"
        }
      }
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

// src/lib/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    message: "Route Not Found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
};

// src/lib/middleware/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let error = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provided incorrect field type or missing required fields";
    error = err;
  }
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate entry";
      error = err;
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "You provided incorrect field type or missing required fields";
      error = err;
    }
  }
  if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 400;
    errorMessage = "You provided incorrect field type or missing required fields";
    error = err;
  }
  if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    statusCode = 400;
    errorMessage = "You provided incorrect field type or missing required fields";
    error = err;
  }
  res.status(statusCode).json({
    message: errorMessage,
    error
  });
}
var globalErrorHandler_default = errorHandler;

// src/server/modules/tutors/tutors.routes.ts
import { Router } from "express";
import { body } from "express-validator";

// src/server/modules/tutors/tutors.services.ts
var TutorService = class {
  /**
   * Create tutor profile
   */
  async createProfile(userId, data) {
    const { categoryIds, ...profileData } = data;
    const existingProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (existingProfile) {
      throw new Error("Tutor profile already exists");
    }
    await prisma.user.update({
      where: { id: userId },
      data: { role: "TUTOR" }
    });
    const tutorProfile = await prisma.tutorProfile.create({
      data: {
        ...profileData,
        userId,
        categories: {
          create: categoryIds.map((categoryId, index) => ({
            categoryId,
            isPrimary: index === 0
            // First category is primary
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    return tutorProfile;
  }
  //get all tutors
  async getAllTutors() {
    const tutors = await prisma.tutorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    return tutors;
  }
  /**
   * Get tutor profile by user ID
   */
  async getTutorProfileByUserId(userId) {
    return prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  }
  /**
   * Get tutor profile by ID
   */
  async getProfileById(tutorId) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            bio: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        availability: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" }
        },
        reviews: {
          where: { isVisible: true },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    return tutorProfile;
  }
  /**
   * Update tutor profile
   */
  async updateProfile(userId, data) {
    const { categoryIds, ...profileData } = data;
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    if (categoryIds) {
      await prisma.tutorCategory.deleteMany({
        where: { tutorId: tutorProfile.id }
      });
      await prisma.tutorCategory.createMany({
        data: categoryIds.map((categoryId, index) => ({
          tutorId: tutorProfile.id,
          categoryId,
          isPrimary: index === 0
        }))
      });
    }
    const updatedProfile = await prisma.tutorProfile.update({
      where: { userId },
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    return updatedProfile;
  }
  /**
   * Search and filter tutors
   */
  //  async searchTutors(
  //     filters: TutorSearchFilters,
  //     page: number,
  //     limit: number
  //   ) {
  //     const where: any = {
  //       isAvailable: true, // Always show available tutors
  //     };
  //     // Category filter
  //     if (filters.categoryId) {
  //       where.categories = {
  //         some: {
  //           categoryId: filters.categoryId,
  //         },
  //       };
  //     }
  //     // Search filter
  //     if (filters.search) {
  //       where.OR = [
  //         { title: { contains: filters.search, mode: 'insensitive' } },
  //         { description: { contains: filters.search, mode: 'insensitive' } },
  //         {
  //           user: {
  //             name: { contains: filters.search, mode: 'insensitive' },
  //           },
  //         },
  //       ];
  //     }
  //     // Hourly rate filter
  //     if (filters.minRate || filters.maxRate) {
  //       where.hourlyRate = {};
  //       if (filters.minRate) where.hourlyRate.gte = filters.minRate;
  //       if (filters.maxRate) where.hourlyRate.lte = filters.maxRate;
  //     }
  //     // Rating filter
  //     if (filters.minRating) {
  //       where.averageRating = { gte: filters.minRating };
  //     }
  //     const skip = (page - 1) * limit;
  //     const [tutors, total] = await Promise.all([
  //       prisma.tutorProfile.findMany({
  //         where,
  //         include: {
  //           user: true,
  //           categories: { include: { category: true } },
  //         },
  //         skip,
  //         take: limit,
  //         orderBy: { createdAt: 'desc' },
  //       }),
  //       prisma.tutorProfile.count({ where }),
  //     ]);
  //     return {
  //       data: tutors,
  //       meta: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     };
  //   }
  async searchTutors(query) {
    const {
      categoryId,
      search,
      minRate,
      maxRate,
      minRating,
      sortBy = "createdAt",
      page = 1,
      limit = 12
    } = query;
    const where = {
      isAvailable: true
    };
    if (categoryId) {
      where.categories = {
        some: { categoryId }
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          user: {
            name: { contains: search, mode: "insensitive" }
          }
        }
      ];
    }
    if (minRate) {
      where.hourlyRate = { gte: Number(minRate) };
    }
    if (maxRate) {
      where.hourlyRate = {
        ...where.hourlyRate,
        lte: Number(maxRate)
      };
    }
    if (minRating) {
      where.averageRating = { gte: Number(minRating) };
    }
    let orderBy = { createdAt: "desc" };
    if (sortBy === "averageRating") {
      orderBy = { averageRating: "desc" };
    } else if (sortBy === "hourlyRate") {
      orderBy = { hourlyRate: "asc" };
    } else if (sortBy === "totalSessions") {
      orderBy = { totalSessions: "desc" };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const [tutors, total] = await Promise.all([
      prisma.tutorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          categories: {
            include: { category: true }
          }
        },
        skip,
        take,
        orderBy
      }),
      prisma.tutorProfile.count({ where })
    ]);
    return {
      data: tutors,
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    };
  }
  /**
   * Toggle tutor availability
   */
  async toggleAvailability(userId) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const updated = await prisma.tutorProfile.update({
      where: { userId },
      data: {
        isAvailable: !tutorProfile.isAvailable
      }
    });
    return updated;
  }
};
var tutors_services_default = new TutorService();

// src/utils/helper.ts
var successResponse = (data, message) => {
  return {
    success: true,
    data,
    message
  };
};
var errorResponse = (error, errors) => {
  return {
    success: false,
    error,
    errors
  };
};
var isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};
var calculateDuration = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;
  return endInMinutes - startInMinutes;
};
var generateSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};

// src/server/modules/tutors/tutors.controller.ts
var TutorController = class {
  /**
   * Create tutor profile
   */
  async createProfile(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const profile = await tutors_services_default.createProfile(req.user.id, req.body);
      res.status(201).json(successResponse(profile, "Tutor profile created successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  //get all tutors
  async getAllTutors(req, res, next) {
    try {
      const tutors = await tutors_services_default.getAllTutors();
      res.json(successResponse(tutors));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get own tutor profile
   */
  async getOwnProfile(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const profile = await tutors_services_default.getTutorProfileByUserId(req.user.id);
      res.json(successResponse(profile));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get tutor profile by user ID
   */
  async getTutorProfileByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const tutorProfile = await tutors_services_default.getTutorProfileByUserId(userId);
      if (!tutorProfile) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found"
        });
      }
      res.json({
        success: true,
        data: tutorProfile
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get tutor profile by ID
   */
  async getProfileById(req, res, next) {
    try {
      const { tutorId } = req.params;
      const profile = await tutors_services_default.getProfileById(tutorId);
      res.json(successResponse(profile));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Update tutor profile
   */
  async updateProfile(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const profile = await tutors_services_default.updateProfile(req.user.id, req.body);
      res.json(successResponse(profile, "Profile updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Search tutors
   */
  // async searchTutors(req: AuthRequest, res: Response, next: NextFunction) {
  //     try {
  //       const {
  //         categoryId,
  //         search,
  //         minRate,
  //         maxRate,
  //         minRating,
  //         page = 1,
  //         limit = 12,
  //       } = req.query;
  //       const filters = {
  //         categoryId: categoryId as string | undefined,
  //         search: search as string | undefined,
  //         minRate: minRate ? Number(minRate) : undefined,
  //         maxRate: maxRate ? Number(maxRate) : undefined,
  //         minRating: minRating ? Number(minRating) : undefined,
  //       };
  //       const result = await TutorService.searchTutors(
  //         filters,
  //         Number(page),
  //         Number(limit)
  //       );
  //       res.json({
  //         success: true,
  //         data: result,
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   }
  async searchTutors(req, res, next) {
    try {
      const result = await tutors_services_default.searchTutors(req.query);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Toggle tutor availability
   */
  async toggleAvailability(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const profile = await tutors_services_default.toggleAvailability(req.user.id);
      res.json(successResponse(profile, "Availability updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
};
var tutors_controller_default = new TutorController();

// src/lib/middleware/validation.ts
import { validationResult } from "express-validator";
var validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg
    }));
    res.status(400).json(errorResponse("Validation failed", extractedErrors));
  };
};

// src/lib/middleware/authMiddleware.ts
var authenticate = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session) {
      res.status(401).json(errorResponse("No active session"));
      return;
    }
    const user = session.user;
    if (!user) {
      res.status(401).json(errorResponse("User not found"));
      return;
    }
    if (user.status !== "ACTIVE" /* ACTIVE */) {
      res.status(403).json(errorResponse("Account is not active"));
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json(errorResponse("Authentication failed"));
  }
};
var authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json(errorResponse("Not authenticated"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json(errorResponse("Insufficient permissions"));
      return;
    }
    next();
  };
};
var isTutor = authorize("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */);
var isAdmin = authorize("ADMIN" /* ADMIN */);

// src/server/modules/tutors/tutors.routes.ts
var router = Router();
var createProfileValidation = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("headline").optional().isString().trim(),
  body("description").optional().isString().trim(),
  body("hourlyRate").isFloat({ min: 0 }).withMessage("Hourly rate must be a positive number"),
  body("experience").optional().isInt({ min: 0 }).withMessage("Experience must be a positive number"),
  body("education").optional().isString().trim(),
  body("categoryIds").isArray({ min: 1 }).withMessage("At least one category is required"),
  body("categoryIds.*").isString().withMessage("Invalid category ID")
];
var updateProfileValidation = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty").trim(),
  body("headline").optional().isString().trim(),
  body("description").optional().isString().trim(),
  body("hourlyRate").optional().isFloat({ min: 0 }).withMessage("Hourly rate must be a positive number"),
  body("experience").optional().isInt({ min: 0 }).withMessage("Experience must be a positive number"),
  body("education").optional().isString().trim(),
  body("isAvailable").optional().isBoolean().withMessage("isAvailable must be boolean"),
  body("categoryIds").optional().isArray().withMessage("categoryIds must be an array"),
  body("categoryIds.*").optional().isString().withMessage("Invalid category ID")
];
router.get("/", tutors_controller_default.getAllTutors);
router.get("/search", tutors_controller_default.searchTutors);
router.get("/user/:userId", tutors_controller_default.getTutorProfileByUserId);
router.get("/:tutorId", tutors_controller_default.getProfileById);
router.post("/profile", authenticate, validate(createProfileValidation), tutors_controller_default.createProfile);
router.get("/profile/me", authenticate, isTutor, tutors_controller_default.getOwnProfile);
router.put("/profile", authenticate, isTutor, validate(updateProfileValidation), tutors_controller_default.updateProfile);
router.patch("/availability/toggle", authenticate, isTutor, tutors_controller_default.toggleAvailability);
var TutorRoutes = router;

// src/server/modules/booking/booking.routes.ts
import { Router as Router2 } from "express";
import { body as body2 } from "express-validator";

// src/server/modules/booking/booking.services.ts
var BookingService = class {
  /**
   * Create a new booking
   */
  async createBooking(studentId, data) {
    const { tutorId, subject, sessionDate, startTime, endTime, studentNotes } = data;
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    if (!tutorProfile.isAvailable) {
      throw new Error("Tutor is not currently available");
    }
    const duration = calculateDuration(startTime, endTime);
    const price = Number(tutorProfile.hourlyRate) * duration / 60;
    const booking = await prisma.booking.create({
      data: {
        studentId,
        tutorId,
        tutorProfileId: tutorProfile.id,
        subject,
        sessionDate: new Date(sessionDate),
        startTime,
        endTime,
        duration,
        price,
        studentNotes,
        status: "CONFIRMED"
        // Instant confirmation
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tutorProfile: {
          select: {
            id: true,
            title: true,
            hourlyRate: true
          }
        }
      }
    });
    return booking;
  }
  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tutorProfile: {
          select: {
            id: true,
            title: true,
            hourlyRate: true
          }
        },
        review: true
      }
    });
    if (!booking) {
      throw new Error("Booking not found");
    }
    return booking;
  }
  /**
   * Get user bookings
   */
  async getMyBookings(userId, userRole) {
    let where = {};
    if (userRole === "STUDENT") {
      where.studentId = userId;
    } else if (userRole === "TUTOR") {
      where.tutorId = userId;
    }
    return prisma.booking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tutorProfile: {
          include: {
            user: true
          }
        },
        review: true
      },
      orderBy: {
        sessionDate: "desc"
      }
    });
  }
  /**
   * Update booking status
   */
  async updateBooking(bookingId, userId, data) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking.studentId !== userId && booking.tutorId !== userId) {
      throw new Error("Not authorized to update this booking");
    }
    if (data.status === "CANCELLED") {
      const updated2 = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledBy: userId,
          cancelReason: data.cancelReason,
          cancelledAt: /* @__PURE__ */ new Date(),
          tutorNotes: data.tutorNotes
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tutor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return updated2;
    }
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: data.status,
        tutorNotes: data.tutorNotes
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    return updated;
  }
  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, reason) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking.studentId !== userId && booking.tutorId !== userId) {
      throw new Error("Not authorized to cancel this booking");
    }
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      throw new Error("Cannot cancel this booking");
    }
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledBy: userId,
        cancelReason: reason,
        cancelledAt: /* @__PURE__ */ new Date()
      }
    });
    return updated;
  }
  /**
   * Mark booking as complete (Tutor only)
   */
  async markAsComplete(bookingId, tutorId, tutorNotes) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId }
      });
      if (!booking) {
        throw new Error("Booking not found");
      }
      if (booking.tutorId !== tutorId) {
        throw new Error("Not authorized to complete this booking");
      }
      if (booking.status !== "CONFIRMED") {
        throw new Error("Can only complete confirmed bookings");
      }
      const [endHour, endMinute] = booking.endTime.split(":").map(Number);
      const sessionEndDateTime = new Date(booking.sessionDate);
      sessionEndDateTime.setHours(endHour, endMinute, 0, 0);
      if (sessionEndDateTime > /* @__PURE__ */ new Date()) {
        throw new Error("Cannot mark booking as complete before session ends");
      }
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "COMPLETED",
          tutorNotes: tutorNotes ?? "Marked as completed by tutor."
        },
        include: {
          student: {
            select: { id: true, name: true, email: true }
          },
          tutor: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      await tx.tutorProfile.update({
        where: { id: booking.tutorProfileId },
        data: {
          totalSessions: { increment: 1 }
        }
      });
      return updated;
    });
  }
  /**
   * Get booking statistics
   */
  async getBookingStats(userId, userRole) {
    const where = userRole === "TUTOR" ? { tutorId: userId } : { studentId: userId };
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { ...where, status: "PENDING" } }),
      prisma.booking.count({ where: { ...where, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.booking.count({ where: { ...where, status: "CANCELLED" } })
    ]);
    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled
    };
  }
};
var booking_services_default = new BookingService();

// src/server/modules/booking/booking.controller.ts
var BookingController = class {
  /**
   * Create a new booking
   */
  async createBooking(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const booking = await booking_services_default.createBooking(req.user.id, req.body);
      res.status(201).json(successResponse(booking, "Booking created successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get booking by ID
   */
  async getBookingById(req, res, next) {
    try {
      const { bookingId } = req.params;
      const booking = await booking_services_default.getBookingById(bookingId);
      if (req.user && booking.studentId !== req.user.id && booking.tutorId !== req.user.id) {
        res.status(403).json(errorResponse("Not authorized to view this booking"));
        return;
      }
      res.json(successResponse(booking));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get user bookings
   */
  async getMyBookings(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const { id: userId, role: userRole } = req.user;
      const bookings = await booking_services_default.getMyBookings(
        userId,
        userRole
      );
      res.json({
        success: true,
        data: {
          data: bookings,
          meta: {
            total: bookings.length,
            page: 1,
            limit: bookings.length,
            totalPages: 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Update booking
   */
  async updateBooking(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { bookingId } = req.params;
      const booking = await booking_services_default.updateBooking(bookingId, req.user.id, req.body);
      res.json(successResponse(booking, "Booking updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Cancel booking
   */
  async cancelBooking(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { bookingId } = req.params;
      const { reason } = req.body;
      const booking = await booking_services_default.cancelBooking(bookingId, req.user.id, reason);
      res.json(successResponse(booking, "Booking cancelled successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Mark booking as complete (Tutor only)
   */
  async markAsComplete(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { bookingId } = req.params;
      const { tutorNotes } = req.body;
      const booking = await booking_services_default.markAsComplete(bookingId, req.user.id, tutorNotes);
      res.json(successResponse(booking, "Booking marked as complete"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get booking statistics
   */
  async getBookingStats(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const stats = await booking_services_default.getBookingStats(req.user.id, req.user.role);
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
};
var booking_controller_default = new BookingController();

// src/server/modules/booking/booking.routes.ts
var router2 = Router2();
var createBookingValidation = [
  body2("tutorId").notEmpty().withMessage("Tutor ID is required"),
  body2("subject").notEmpty().withMessage("Subject is required").trim(),
  body2("sessionDate").isISO8601().withMessage("Valid session date is required"),
  body2("startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid start time format (HH:mm)"),
  body2("endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid end time format (HH:mm)"),
  body2("studentNotes").optional().isString().trim()
];
var updateBookingValidation = [
  body2("status").optional().isIn(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).withMessage("Invalid status"),
  body2("tutorNotes").optional().isString().trim(),
  body2("cancelReason").optional().isString().trim()
];
var cancelBookingValidation = [
  body2("reason").optional().isString().trim()
];
router2.post("/", authenticate, validate(createBookingValidation), booking_controller_default.createBooking);
router2.get("/my-bookings", authenticate, booking_controller_default.getMyBookings);
router2.get("/stats", authenticate, booking_controller_default.getBookingStats);
router2.get("/:bookingId", authenticate, booking_controller_default.getBookingById);
router2.put("/:bookingId", authenticate, validate(updateBookingValidation), booking_controller_default.updateBooking);
router2.post("/:bookingId/cancel", authenticate, validate(cancelBookingValidation), booking_controller_default.cancelBooking);
router2.post("/:bookingId/complete", authenticate, booking_controller_default.markAsComplete);
var BookingRoutes = router2;

// src/server/modules/tutor-category/tutor-category.routes.ts
import { Router as Router3 } from "express";
import { body as body3 } from "express-validator";

// src/server/modules/tutor-category/tutor-category.services.ts
var CategoryService = class {
  /**
   * Create a new category
   */
  async createCategory(data) {
    const { name, slug, description, icon, color } = data;
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }]
      }
    });
    if (existing) {
      throw new Error("Category with this name or slug already exists");
    }
    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || generateSlug(name),
        description,
        icon,
        color
      }
    });
    return category;
  }
  /**
   * Get all categories
   */
  async getAllCategories(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            tutors: true
          }
        }
      }
    });
    return categories;
  }
  /**
   * Get category by ID
   */
  async getCategoryById(categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            tutors: true
          }
        }
      }
    });
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }
  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            tutors: true
          }
        }
      }
    });
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }
  /**
   * Update category
   */
  async updateCategory(categoryId, data) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      throw new Error("Category not found");
    }
    if (data.slug && data.slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug: data.slug }
      });
      if (existing) {
        throw new Error("Category with this slug already exists");
      }
    }
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data
    });
    return updated;
  }
  /**
   * Delete category
   */
  async deleteCategory(categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            tutors: true
          }
        }
      }
    });
    if (!category) {
      throw new Error("Category not found");
    }
    if (category._count.tutors > 0) {
      throw new Error("Cannot delete category with associated tutors");
    }
    await prisma.category.delete({
      where: { id: categoryId }
    });
    return { message: "Category deleted successfully" };
  }
  /**
   * Toggle category active status
   */
  async toggleCategoryStatus(categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      throw new Error("Category not found");
    }
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        isActive: !category.isActive
      }
    });
    return updated;
  }
};
var tutor_category_services_default = new CategoryService();

// src/server/modules/tutor-category/tutor-category.controller.ts
var CategoryController = class {
  /**
   * Create a category (Admin only)
   */
  async createCategory(req, res, next) {
    try {
      const category = await tutor_category_services_default.createCategory(req.body);
      res.status(201).json(successResponse(category, "Category created successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get all categories
   */
  async getAllCategories(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const categories = await tutor_category_services_default.getAllCategories(includeInactive);
      res.json(successResponse(categories));
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get category by ID
   */
  async getCategoryById(req, res, next) {
    try {
      const { categoryId } = req.params;
      const category = await tutor_category_services_default.getCategoryById(categoryId);
      res.json(successResponse(category));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get category by slug
   */
  async getCategoryBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const category = await tutor_category_services_default.getCategoryBySlug(slug);
      res.json(successResponse(category));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Update category (Admin only)
   */
  async updateCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const category = await tutor_category_services_default.updateCategory(categoryId, req.body);
      res.json(successResponse(category, "Category updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Delete category (Admin only)
   */
  async deleteCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const result = await tutor_category_services_default.deleteCategory(categoryId);
      res.json(successResponse(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Toggle category status (Admin only)
   */
  async toggleStatus(req, res, next) {
    try {
      const { categoryId } = req.params;
      const category = await tutor_category_services_default.toggleCategoryStatus(categoryId);
      res.json(successResponse(category, "Category status updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
};
var tutor_category_controller_default = new CategoryController();

// src/server/modules/tutor-category/tutor-category.routes.ts
var router3 = Router3();
var createCategoryValidation = [
  body3("name").notEmpty().withMessage("Name is required").trim(),
  body3("slug").notEmpty().withMessage("Slug is required").trim(),
  body3("description").optional().isString().trim(),
  body3("icon").optional().isString().trim(),
  body3("color").optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage("Invalid color format")
];
var updateCategoryValidation = [
  body3("name").optional().notEmpty().withMessage("Name cannot be empty").trim(),
  body3("slug").optional().notEmpty().withMessage("Slug cannot be empty").trim(),
  body3("description").optional().isString().trim(),
  body3("icon").optional().isString().trim(),
  body3("color").optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage("Invalid color format"),
  body3("isActive").optional().isBoolean().withMessage("isActive must be boolean")
];
router3.get("/", tutor_category_controller_default.getAllCategories);
router3.get("/:categoryId", tutor_category_controller_default.getCategoryById);
router3.get("/slug/:slug", tutor_category_controller_default.getCategoryBySlug);
router3.post("/", tutor_category_controller_default.createCategory);
router3.put("/:categoryId", authenticate, isAdmin, validate(updateCategoryValidation), tutor_category_controller_default.updateCategory);
router3.delete("/:categoryId", authenticate, isAdmin, tutor_category_controller_default.deleteCategory);
router3.patch("/:categoryId/toggle-status", authenticate, isAdmin, tutor_category_controller_default.toggleStatus);
var CategoryRoutes = router3;

// src/server/modules/user/user.routes.ts
import { Router as Router4 } from "express";
import { body as body4 } from "express-validator";

// src/server/modules/user/user.services.ts
var UserService = class {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        image: true,
        bio: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        tutorProfile: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        image: true,
        bio: true,
        phone: true,
        updatedAt: true
      }
    });
    return user;
  }
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(filters) {
    const where = {};
    if (filters.role && filters.role !== "ALL") {
      where.role = filters.role;
    }
    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }
    return prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId) {
    await prisma.user.delete({
      where: { id: userId }
    });
    return { message: "User deleted successfully" };
  }
  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId, role) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    });
    return user;
  }
  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(userId, status) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    });
    return user;
  }
};
var user_services_default = new UserService();

// src/server/modules/user/user.controller.ts
var UserController = class {
  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const user = await user_services_default.getUserById(req.user.id);
      res.json(successResponse(user));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get user by ID
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await user_services_default.getUserById(userId);
      res.json(successResponse(user));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const user = await user_services_default.updateProfile(req.user.id, req.body);
      res.json(successResponse(user, "Profile updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const { role, status } = req.query;
      const filters = {
        role,
        status
      };
      const users = await user_services_default.getAllUsers(filters);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Delete user (Admin only)
   */
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await user_services_default.deleteUser(userId);
      res.json(successResponse(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Update user role (Admin only)
   */
  async updateUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const user = await user_services_default.updateUserRole(userId, role);
      res.json(successResponse(user, "User role updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const user = await user_services_default.updateUserStatus(userId, status);
      res.json(successResponse(user, "User status updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
};
var user_controller_default = new UserController();

// src/server/modules/user/user.routes.ts
var router4 = Router4();
var updateProfileValidation2 = [
  body4("name").optional().isString().trim(),
  body4("bio").optional().isString().trim(),
  body4("phone").optional().isString().trim(),
  body4("image").optional().isURL().withMessage("Image must be a valid URL")
];
var updateRoleValidation = [
  body4("role").isIn(["STUDENT", "TUTOR", "ADMIN"]).withMessage("Invalid role")
];
var updateStatusValidation = [
  body4("status").isIn(["ACTIVE", "BANNED", "SUSPENDED"]).withMessage("Invalid status")
];
router4.get("/profile", authenticate, user_controller_default.getProfile);
router4.put("/profile", authenticate, validate(updateProfileValidation2), user_controller_default.updateProfile);
router4.get("/:userId", authenticate, user_controller_default.getUserById);
router4.get("/", authenticate, isAdmin, user_controller_default.getAllUsers);
router4.delete("/:userId", authenticate, isAdmin, user_controller_default.deleteUser);
router4.patch("/:userId/role", authenticate, isAdmin, validate(updateRoleValidation), user_controller_default.updateUserRole);
router4.patch("/:userId/status", authenticate, isAdmin, validate(updateStatusValidation), user_controller_default.updateUserStatus);
var UserRoutes = router4;

// src/server/modules/dashboard/dashboard.routes.ts
import { Router as Router5 } from "express";

// src/server/modules/dashboard/dashboard.services.ts
var DashboardService = class {
  /**
   * Get student dashboard overview
   */
  async getStudentDashboard(studentId) {
    const [
      upcomingBookings,
      recentBookings,
      totalBookings,
      completedSessions,
      pendingSessions,
      totalSpent
    ] = await Promise.all([
      // Upcoming bookings (confirmed, future sessions)
      prisma.booking.findMany({
        where: {
          studentId,
          status: "CONFIRMED",
          sessionDate: {
            gte: /* @__PURE__ */ new Date()
          }
        },
        take: 5,
        orderBy: { sessionDate: "asc" },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          tutorProfile: {
            select: {
              title: true
            }
          }
        }
      }),
      // Recent bookings
      prisma.booking.findMany({
        where: {
          studentId
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          tutorProfile: {
            select: {
              title: true
            }
          }
        }
      }),
      // Total bookings count
      prisma.booking.count({
        where: { studentId }
      }),
      // Completed sessions
      prisma.booking.count({
        where: {
          studentId,
          status: "COMPLETED"
        }
      }),
      // Pending sessions (awaiting confirmation)
      prisma.booking.count({
        where: {
          studentId,
          status: "PENDING"
        }
      }),
      // Total amount spent
      prisma.booking.aggregate({
        where: {
          studentId,
          status: "COMPLETED"
        },
        _sum: {
          price: true
        }
      })
    ]);
    const favoriteTutors = await prisma.booking.groupBy({
      by: ["tutorId"],
      where: {
        studentId,
        status: {
          in: ["COMPLETED", "CONFIRMED"]
        }
      },
      _count: {
        tutorId: true
      },
      orderBy: {
        _count: {
          tutorId: "desc"
        }
      },
      take: 3
    });
    const tutorIds = favoriteTutors.map((t) => t.tutorId);
    const tutorDetails = await prisma.user.findMany({
      where: {
        id: {
          in: tutorIds
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        tutorProfile: {
          select: {
            id: true,
            title: true,
            averageRating: true
          }
        }
      }
    });
    return {
      overview: {
        totalBookings,
        completedSessions,
        pendingSessions,
        totalSpent: totalSpent._sum.price || 0
      },
      upcomingBookings,
      recentBookings,
      favoriteTutors: tutorDetails
    };
  }
  /**
   * Get tutor dashboard overview
   */
  async getTutorDashboard(tutorId) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const [
      upcomingSessions,
      recentSessions,
      totalSessions,
      completedSessions,
      pendingSessions,
      totalEarnings,
      thisMonthEarnings,
      studentsCount
    ] = await Promise.all([
      // Upcoming sessions (confirmed, future)
      prisma.booking.findMany({
        where: {
          tutorId,
          status: "CONFIRMED",
          sessionDate: {
            gte: /* @__PURE__ */ new Date()
          }
        },
        take: 5,
        orderBy: { sessionDate: "asc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          }
        }
      }),
      // Recent sessions
      prisma.booking.findMany({
        where: {
          tutorId
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }),
      // Total sessions
      prisma.booking.count({
        where: { tutorId }
      }),
      // Completed sessions
      prisma.booking.count({
        where: {
          tutorId,
          status: "COMPLETED"
        }
      }),
      // Pending sessions (awaiting confirmation)
      prisma.booking.count({
        where: {
          tutorId,
          status: "PENDING"
        }
      }),
      // Total earnings
      prisma.booking.aggregate({
        where: {
          tutorId,
          status: "COMPLETED"
        },
        _sum: {
          price: true
        }
      }),
      // This month earnings
      prisma.booking.aggregate({
        where: {
          tutorId,
          status: "COMPLETED",
          sessionDate: {
            gte: new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1)
          }
        },
        _sum: {
          price: true
        }
      }),
      // Unique students count
      prisma.booking.findMany({
        where: {
          tutorId,
          status: {
            in: ["COMPLETED", "CONFIRMED"]
          }
        },
        distinct: ["studentId"],
        select: {
          studentId: true
        }
      })
    ]);
    const recentReviews = await prisma.review.findMany({
      where: {
        tutorId: tutorProfile.id,
        isVisible: true
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    return {
      overview: {
        totalSessions,
        completedSessions,
        pendingSessions,
        totalEarnings: totalEarnings._sum.price || 0,
        thisMonthEarnings: thisMonthEarnings._sum.price || 0,
        studentsCount: studentsCount.length,
        averageRating: tutorProfile.averageRating,
        totalReviews: tutorProfile.totalReviews
      },
      upcomingSessions,
      recentSessions,
      recentReviews,
      profileStatus: {
        isAvailable: tutorProfile.isAvailable,
        isVerified: tutorProfile.isVerified
      }
    };
  }
  /**
   * Get admin dashboard overview
   */
  async getAdminDashboard() {
    const now = /* @__PURE__ */ new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [
      totalUsers,
      totalTutors,
      totalStudents,
      totalBookings,
      completedBookings,
      thisMonthBookings,
      lastMonthBookings,
      totalRevenue,
      thisMonthRevenue,
      activeCategories,
      recentUsers,
      recentBookings,
      topTutors
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      // Total tutors
      prisma.user.count({
        where: { role: "TUTOR" }
      }),
      // Total students
      prisma.user.count({
        where: { role: "STUDENT" }
      }),
      // Total bookings
      prisma.booking.count(),
      // Completed bookings
      prisma.booking.count({
        where: { status: "COMPLETED" }
      }),
      // This month bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      // Last month bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth
          }
        }
      }),
      // Total revenue
      prisma.booking.aggregate({
        where: { status: "COMPLETED" },
        _sum: {
          price: true
        }
      }),
      // This month revenue
      prisma.booking.aggregate({
        where: {
          status: "COMPLETED",
          sessionDate: {
            gte: firstDayOfMonth
          }
        },
        _sum: {
          price: true
        }
      }),
      // Active categories
      prisma.category.count({
        where: { isActive: true }
      }),
      // Recent users
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true
        }
      }),
      // Recent bookings
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tutor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      // Top tutors by sessions
      prisma.tutorProfile.findMany({
        take: 10,
        orderBy: { totalSessions: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
    ]);
    const bookingGrowth = lastMonthBookings > 0 ? (thisMonthBookings - lastMonthBookings) / lastMonthBookings * 100 : 0;
    return {
      overview: {
        totalUsers,
        totalTutors,
        totalStudents,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenue._sum.price || 0,
        thisMonthRevenue: thisMonthRevenue._sum.price || 0,
        activeCategories,
        thisMonthBookings,
        lastMonthBookings,
        bookingGrowth: Math.round(bookingGrowth * 100) / 100
      },
      recentUsers,
      recentBookings,
      topTutors
    };
  }
  /**
   * Get booking statistics by date range
   */
  async getBookingStatsByDateRange(startDate, endDate, tutorId) {
    const where = {
      sessionDate: {
        gte: startDate,
        lte: endDate
      }
    };
    if (tutorId) {
      where.tutorId = tutorId;
    }
    const [bookings, revenue] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          status: true,
          sessionDate: true,
          price: true
        }
      }),
      prisma.booking.aggregate({
        where: {
          ...where,
          status: "COMPLETED"
        },
        _sum: {
          price: true
        }
      })
    ]);
    const bookingsByDate = bookings.reduce((acc, booking) => {
      const date = booking.sessionDate.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          completed: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          revenue: 0
        };
      }
      acc[date].total++;
      acc[date][booking.status.toLowerCase()]++;
      if (booking.status === "COMPLETED") {
        acc[date].revenue += Number(booking.price);
      }
      return acc;
    }, {});
    return {
      totalRevenue: revenue._sum.price || 0,
      bookingsByDate: Object.values(bookingsByDate)
    };
  }
};
var dashboard_services_default = new DashboardService();

// src/server/modules/dashboard/dashboard.controller.ts
var DashboardController = class {
  /**
   * Get student dashboard
   */
  async getStudentDashboard(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      if (req.user.role !== "STUDENT") {
        res.status(403).json(errorResponse("Access denied. Students only."));
        return;
      }
      const dashboard = await dashboard_services_default.getStudentDashboard(req.user.id);
      res.json(successResponse(dashboard));
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get tutor dashboard
   */
  async getTutorDashboard(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      if (req.user.role !== "TUTOR" && req.user.role !== "ADMIN") {
        res.status(403).json(errorResponse("Access denied. Tutors only."));
        return;
      }
      const dashboard = await dashboard_services_default.getTutorDashboard(req.user.id);
      res.json(successResponse(dashboard));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get admin dashboard
   */
  async getAdminDashboard(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      if (req.user.role !== "ADMIN") {
        res.status(403).json(errorResponse("Access denied. Admins only."));
        return;
      }
      const dashboard = await dashboard_services_default.getAdminDashboard();
      res.json(successResponse(dashboard));
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get booking statistics by date range
   */
  async getBookingStats(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() - 30));
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const tutorId = req.user.role === "TUTOR" ? req.user.id : void 0;
      const stats = await dashboard_services_default.getBookingStatsByDateRange(
        startDate,
        endDate,
        tutorId
      );
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
};
var dashboard_controller_default = new DashboardController();

// src/server/modules/dashboard/dashboard.routes.ts
var router5 = Router5();
router5.get(
  "/student",
  authenticate,
  authorize("STUDENT" /* STUDENT */),
  dashboard_controller_default.getStudentDashboard
);
router5.get(
  "/tutor",
  authenticate,
  authorize("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  dashboard_controller_default.getTutorDashboard
);
router5.get(
  "/admin",
  authenticate,
  authorize("ADMIN" /* ADMIN */),
  dashboard_controller_default.getAdminDashboard
);
router5.get(
  "/stats",
  authenticate,
  dashboard_controller_default.getBookingStats
);
var DashboardRoutes = router5;

// src/server/modules/availability/availability.routes.ts
import { Router as Router6 } from "express";
import { body as body5 } from "express-validator";

// src/server/modules/availability/availability.services.ts
var AvailabilityService = class {
  /**
   * Add availability slot
   */
  async addAvailability(userId, data) {
    const { dayOfWeek, startTime, endTime } = data;
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      throw new Error("Invalid time format. Use HH:mm format (e.g., 09:00)");
    }
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const overlapping = await prisma.availability.findFirst({
      where: {
        tutorId: tutorProfile.id,
        dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });
    if (overlapping) {
      throw new Error("This time slot overlaps with existing availability");
    }
    const availability = await prisma.availability.create({
      data: {
        tutorId: tutorProfile.id,
        dayOfWeek,
        startTime,
        endTime
      }
    });
    return availability;
  }
  /**
   * Get tutor availability
   */
  async getTutorAvailability(tutorId) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const availability = await prisma.availability.findMany({
      where: {
        tutorId: tutorProfile.id,
        isActive: true
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" }
      ]
    });
    const grouped = availability.reduce((acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek].push(slot);
      return acc;
    }, {});
    return grouped;
  }
  /**
   * Update availability slot
   */
  async updateAvailability(availabilityId, userId, data) {
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        tutor: {
          select: {
            userId: true
          }
        }
      }
    });
    if (!availability) {
      throw new Error("Availability slot not found");
    }
    if (availability.tutor.userId !== userId) {
      throw new Error("Not authorized to update this availability");
    }
    if (data.startTime && !isValidTimeFormat(data.startTime)) {
      throw new Error("Invalid start time format. Use HH:mm format (e.g., 09:00)");
    }
    if (data.endTime && !isValidTimeFormat(data.endTime)) {
      throw new Error("Invalid end time format. Use HH:mm format (e.g., 17:00)");
    }
    const startTime = data.startTime || availability.startTime;
    const endTime = data.endTime || availability.endTime;
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }
    const updated = await prisma.availability.update({
      where: { id: availabilityId },
      data
    });
    return updated;
  }
  /**
   * Delete availability slot
   */
  async deleteAvailability(availabilityId, userId) {
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        tutor: {
          select: {
            userId: true
          }
        }
      }
    });
    if (!availability) {
      throw new Error("Availability slot not found");
    }
    if (availability.tutor.userId !== userId) {
      throw new Error("Not authorized to delete this availability");
    }
    await prisma.availability.delete({
      where: { id: availabilityId }
    });
    return { message: "Availability slot deleted successfully" };
  }
  /**
   * Toggle availability slot active status
   */
  async toggleAvailability(availabilityId, userId) {
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        tutor: {
          select: {
            userId: true
          }
        }
      }
    });
    if (!availability) {
      throw new Error("Availability slot not found");
    }
    if (availability.tutor.userId !== userId) {
      throw new Error("Not authorized to update this availability");
    }
    const updated = await prisma.availability.update({
      where: { id: availabilityId },
      data: {
        isActive: !availability.isActive
      }
    });
    return updated;
  }
  /**
   * Bulk add availability (for multiple days/times)
   */
  async bulkAddAvailability(userId, slots) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    for (const slot of slots) {
      if (!isValidTimeFormat(slot.startTime) || !isValidTimeFormat(slot.endTime)) {
        throw new Error("Invalid time format in one or more slots");
      }
      if (slot.startTime >= slot.endTime) {
        throw new Error("Start time must be before end time in all slots");
      }
    }
    const created = await prisma.availability.createMany({
      data: slots.map((slot) => ({
        tutorId: tutorProfile.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    });
    return created;
  }
};
var availability_services_default = new AvailabilityService();

// src/server/modules/availability/availability.controller.ts
var AvailabilityController = class {
  /**
   * Add availability slot
   */
  async addAvailability(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const availability = await availability_services_default.addAvailability(req.user.id, req.body);
      res.status(201).json(successResponse(availability, "Availability added successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get tutor availability
   */
  async getTutorAvailability(req, res, next) {
    try {
      const { tutorId } = req.params;
      const availability = await availability_services_default.getTutorAvailability(tutorId);
      res.json(successResponse(availability));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get own availability
   */
  async getOwnAvailability(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const availability = await availability_services_default.getTutorAvailability(req.user.id);
      res.json(successResponse(availability));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Update availability slot
   */
  async updateAvailability(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { availabilityId } = req.params;
      const availability = await availability_services_default.updateAvailability(
        availabilityId,
        req.user.id,
        req.body
      );
      res.json(successResponse(availability, "Availability updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Delete availability slot
   */
  async deleteAvailability(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { availabilityId } = req.params;
      const result = await availability_services_default.deleteAvailability(availabilityId, req.user.id);
      res.json(successResponse(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Toggle availability slot
   */
  async toggleAvailability(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { availabilityId } = req.params;
      const availability = await availability_services_default.toggleAvailability(
        availabilityId,
        req.user.id
      );
      res.json(successResponse(availability, "Availability status updated successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Bulk add availability
   */
  async bulkAddAvailability(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { slots } = req.body;
      const result = await availability_services_default.bulkAddAvailability(req.user.id, slots);
      res.status(201).json(successResponse(result, "Availability slots added successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
};
var availability_controller_default = new AvailabilityController();

// src/server/modules/availability/availability.routes.ts
var router6 = Router6();
var addAvailabilityValidation = [
  body5("dayOfWeek").isIn(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).withMessage("Invalid day of week"),
  body5("startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid start time format (HH:mm)"),
  body5("endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid end time format (HH:mm)")
];
var updateAvailabilityValidation = [
  body5("dayOfWeek").optional().isIn(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).withMessage("Invalid day of week"),
  body5("startTime").optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid start time format (HH:mm)"),
  body5("endTime").optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid end time format (HH:mm)")
];
var bulkAddAvailabilityValidation = [
  body5("slots").isArray({ min: 1 }).withMessage("Slots array is required"),
  body5("slots.*.dayOfWeek").isIn(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).withMessage("Invalid day of week"),
  body5("slots.*.startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid start time format (HH:mm)"),
  body5("slots.*.endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid end time format (HH:mm)")
];
router6.get("/tutor/:tutorId", availability_controller_default.getTutorAvailability);
router6.get("/me", authenticate, isTutor, availability_controller_default.getOwnAvailability);
router6.post("/", authenticate, isTutor, validate(addAvailabilityValidation), availability_controller_default.addAvailability);
router6.post("/bulk", authenticate, isTutor, validate(bulkAddAvailabilityValidation), availability_controller_default.bulkAddAvailability);
router6.put("/:availabilityId", authenticate, isTutor, validate(updateAvailabilityValidation), availability_controller_default.updateAvailability);
router6.delete("/:availabilityId", authenticate, isTutor, availability_controller_default.deleteAvailability);
router6.patch("/:availabilityId/toggle", authenticate, isTutor, availability_controller_default.toggleAvailability);
var AvailabilityRoutes = router6;

// src/server/modules/reviews/reviews.routes.ts
import { Router as Router7 } from "express";
import { body as body6 } from "express-validator";

// src/server/modules/reviews/reviews.services.ts
var ReviewService = class {
  /**
   * Create a review
   */
  async createReview(input) {
    const { bookingId, studentId, rating, comment } = input;
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          studentId,
          status: "COMPLETED"
        }
      });
      if (!booking) {
        throw new Error("Booking not found or not completed");
      }
      const existing = await tx.review.findUnique({
        where: { bookingId }
      });
      if (existing) {
        throw new Error("Review already exists");
      }
      await tx.review.create({
        data: {
          bookingId,
          studentId,
          tutorId: booking.tutorProfileId,
          rating,
          comment
        }
      });
      const stats = await tx.review.aggregate({
        where: { tutorId: booking.tutorProfileId },
        _count: { id: true },
        _avg: { rating: true }
      });
      await tx.tutorProfile.update({
        where: { id: booking.tutorProfileId },
        data: {
          totalReviews: stats._count.id,
          averageRating: stats._avg.rating ?? 0
        }
      });
      return { success: true };
    });
  }
  /**
   * Update tutor's average rating
   */
  async updateTutorRating(tutorProfileId) {
    const reviews = await prisma.review.findMany({
      where: {
        tutorId: tutorProfileId,
        isVisible: true
      },
      select: {
        rating: true
      }
    });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : null;
    await prisma.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        totalReviews,
        averageRating: averageRating ? parseFloat(averageRating.toFixed(2)) : null
      }
    });
  }
  /**
   * Get review by ID
   */
  async getReviewById(reviewId) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        tutor: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        booking: {
          select: {
            id: true,
            subject: true,
            sessionDate: true
          }
        }
      }
    });
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  }
  /**
   * Get tutor reviews
   */
  async getTutorReviews(tutorId, page, limit) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { tutorId },
        // ✅ corrected field
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: { tutorId }
        // ✅ corrected field
      })
    ]);
    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  /**
   * Add tutor response to review
   */
  async respondToReview(reviewId, tutorUserId, response) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tutor: {
          select: {
            userId: true
          }
        }
      }
    });
    if (!review) {
      throw new Error("Review not found");
    }
    if (review.tutor.userId !== tutorUserId) {
      throw new Error("Not authorized to respond to this review");
    }
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        response,
        respondedAt: /* @__PURE__ */ new Date()
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    return updated;
  }
  /**
   * Delete review (Admin only)
   */
  async deleteReview(reviewId) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });
    if (!review) {
      throw new Error("Review not found");
    }
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isVisible: false
      }
    });
    await this.updateTutorRating(review.tutorId);
    return { message: "Review deleted successfully" };
  }
};
var reviews_services_default = new ReviewService();

// src/server/modules/reviews/reviews.controller.ts
var ReviewController = class {
  /**
   * Create a review
   */
  async createReview(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const { bookingId, rating, comment } = req.body;
      const studentId = req.user.id;
      const review = await reviews_services_default.createReview({
        bookingId,
        rating,
        comment,
        studentId
      });
      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get review by ID
   */
  async getReviewById(req, res, next) {
    try {
      const { reviewId } = req.params;
      const review = await reviews_services_default.getReviewById(reviewId);
      res.json(successResponse(review));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Get tutor reviews
   */
  async getTutorReviews(req, res, next) {
    try {
      const { tutorId } = req.params;
      const { page = "1", limit = "10" } = req.query;
      const result = await reviews_services_default.getTutorReviews(
        tutorId,
        Number(page),
        Number(limit)
      );
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Respond to a review (Tutor only)
   */
  async respondToReview(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse("Not authenticated"));
        return;
      }
      const { reviewId } = req.params;
      const { response } = req.body;
      const review = await reviews_services_default.respondToReview(reviewId, req.user.id, response);
      res.json(successResponse(review, "Response added successfully"));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
  /**
   * Delete review (Admin only)
   */
  async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const result = await reviews_services_default.deleteReview(reviewId);
      res.json(successResponse(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
};
var reviews_controller_default = new ReviewController();

// src/server/modules/reviews/reviews.routes.ts
var router7 = Router7();
var createReviewValidation = [
  body6("bookingId").notEmpty().withMessage("Booking ID is required"),
  body6("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body6("comment").optional().isString().trim()
];
var respondToReviewValidation = [
  body6("response").notEmpty().withMessage("Response is required").trim()
];
router7.get("/tutor/:tutorId", reviews_controller_default.getTutorReviews);
router7.get("/:reviewId", reviews_controller_default.getReviewById);
router7.post("/", authenticate, validate(createReviewValidation), reviews_controller_default.createReview);
router7.post("/:reviewId/respond", authenticate, isTutor, validate(respondToReviewValidation), reviews_controller_default.respondToReview);
router7.delete("/:reviewId", authenticate, isAdmin, reviews_controller_default.deleteReview);
var ReviewRoutes = router7;

// src/server/app.ts
var app = express();
app.use(cors({
  origin: [
    process.env.APP_URL || "http://localhost:3000",
    "http://localhost:3000",
    // Local development
    "http://localhost:3001"
    // Alternative local port
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/users", UserRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/tutor-categories", CategoryRoutes);
app.use("/api/tutors", TutorRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/availability", AvailabilityRoutes);
app.use("/api/reviews", ReviewRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to Skill Bridge");
});
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server/index.ts
var index_default = app_default;
export {
  index_default as default
};
