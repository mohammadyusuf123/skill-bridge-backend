import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    process.env.APP_URL!, // https://skill-bridge-frontend.vercel.app
  ],

  cookies: {
    session: {
      name: "sb_session",
      options: {
        httpOnly: true,
        secure: true,        // REQUIRED on Vercel
        sameSite: "none",    // 🔥 THIS WAS MISSING
        path: "/",
      },
    },
  },

  // You can KEEP this, but it is NOT enough alone
  advanced: {
    useSecureCookies: true,
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
