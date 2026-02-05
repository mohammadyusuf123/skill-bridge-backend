import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// IMPORTANT: Remove all cookie domain settings from Better-Auth
// Let Better-Auth handle cookies automatically
export const auth = betterAuth({
  // Use absolute URL
  baseURL: 'https://skill-bridge-backend-production-27ac.up.railway.app',
  
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  // ✅ Remove cookie configuration - let Better-Auth handle it
  // cookie: {}, // REMOVE THIS ENTIRE BLOCK
  
  trustedOrigins: [
    "https://skill-bridge-fronted-production.up.railway.app",
    "http://localhost:3000",
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  // ✅ IMPORTANT: Use these advanced settings
  advanced: {
    useSecureCookies: true,
    cookieDomain: '.railway.app', // Set domain here instead
    cookiesSameSite: 'none', // For cross-domain
  },

  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      role: { type: "string", required: true },
      status: { type: "string", required: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
});