import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

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
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // ✅ Configure ALL cookies for cross-site
  advanced: {
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: false, // You're not using subdomains
    },
    // Set default cookie options for ALL cookies
    defaultCookieOptions: {
      sameSite: "none", // ✅ This applies to ALL cookies
      secure: true,
      httpOnly: true,
      path: "/",
    },
    cookies: {
      // Session token cookie
      sessionToken: {
        name: "better-auth.session_token",
        options: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        },
      },
      // Session data cookie
      sessionData: {
        name: "better-auth.session_data",
        options: {
          httpOnly: false, // Frontend needs to read this
          secure: true,
          sameSite: "none", // ✅ CRITICAL
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