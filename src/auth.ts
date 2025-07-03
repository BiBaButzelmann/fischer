import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user } from "./permissions";
import { nextCookies } from "better-auth/next-js";
import { sendConfirmRegistrationEmail } from "@/email/confirmRegistration";
import { sendPasswordResetEmail } from "./email/passwordReset";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", //postgres
  }),
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async (data) => {
      await sendConfirmRegistrationEmail(data.user.email, data.user.name);
    },
  },
  emailAndPassword: {
    minPasswordLength: 6,
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, user.name, url);
    },
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
