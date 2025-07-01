import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user } from "./permissions";
import { nextCookies } from "better-auth/next-js";
import { sendConfirmRegistrationEmail } from "@/email/confirmRegistration";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async (data, _request) => {
      await sendConfirmRegistrationEmail(data.user.email);
    },
  },
  emailAndPassword: {
    minPasswordLength: 6,
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  plugins: [
    nextCookies(),
    adminPlugin({
      defaultRole: "user",
      adminRoles: ["admin"],
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
});
