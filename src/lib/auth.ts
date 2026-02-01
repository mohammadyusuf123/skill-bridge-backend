import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";


export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [process.env.APP_URL!],

  user: {
    additionalFields: {
      phone: { type: "string", required: false },
       role: {
        type: "string",
        required: false
      },
       status: {
        type: "string",
        required: false
      }
    },
  },

  emailAndPassword: {
  enabled: true,
  autoSignIn: true,            // ✅
  requireEmailVerification: false, // (for dev only)
}
});
