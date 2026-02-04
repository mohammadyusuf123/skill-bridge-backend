import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL, // e.g., https://skill-bridge-backend-production-27ac.up.railway.app

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!, // Make sure this is set

  trustedOrigins: [
    "https://skill-bridge-fronted-production.up.railway.app",
    "http://localhost:3000",
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // update every day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // Simplified cookie config
  advanced: {
    useSecureCookies: true,
    cookies: {
      sessionToken: {
        name: "better-auth.session_token", // Use default name
        options: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        },
      },
    },
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