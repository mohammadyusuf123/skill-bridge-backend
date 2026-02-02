import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL, // backend URL

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    process.env.APP_URL!, // frontend URL
  ],

  advanced: {
    cookies: {
      sessionToken: {
        name: "better-auth.session",
        options: {
          httpOnly: true,
          secure: true,          // ✅ REQUIRED on Vercel
          sameSite: "none",      // ✅ REQUIRED for cross-origin
          path: "/",
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
