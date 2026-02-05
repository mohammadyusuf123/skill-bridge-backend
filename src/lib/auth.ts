import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  // ✅ Use absolute URL - THIS IS CRITICAL
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://skill-bridge-backend.railway.app' // Your backend URL on Railway
    : 'http://localhost:5000', // Your backend port

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  // ✅ Remove trustedOrigins or update them
  // trustedOrigins is for BetterAuth's built-in CORS, but you're handling CORS in Express
  
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  // ✅ Simplified cookie settings
  cookie: {
    sameSite: 'lax', // Start with 'lax', not 'none'
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Remove crossSubDomainCookies unless you need it
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