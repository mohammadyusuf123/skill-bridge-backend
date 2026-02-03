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

  // advanced: {
  //   cookies: {
  //     sessionToken: {
  //       name: "better-auth.session",
  //       attributes: {
  //         httpOnly: true,
  //         secure: true,          // ✅ REQUIRED on Vercel
  //          sameSite: "lax", // ✅ Same-origin, so "lax" works
  //       path: "/",
  //       },
  //     },
  //   },
  // },
 session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookies: {
      sessionToken: {
        name: "better-auth.session",
        attributes: {
          httpOnly: true,
          secure: true, // true in production (HTTPS)
          sameSite: "none", // Required for cross-origin requests
          domain: ".vercel.app", // If both frontend and backend are on vercel.app subdomains
          path: "/",
        },
      },
    }
    
    
  
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
