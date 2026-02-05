import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: 'https://skill-bridge-backend-production-27ac.up.railway.app',
  
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [
    "https://skill-bridge-fronted-production.up.railway.app",
    "http://localhost:3000",
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  // ✅ CRITICAL CHANGE: Configure cookies in advanced section
  advanced: {
    useSecureCookies: true,
    cookieDomain: '.railway.app',
    cookiesSameSite: 'none', // Change from Lax to None
  },

  // ✅ Remove the cookie block entirely if present
  // cookie: {}, // REMOVE THIS

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