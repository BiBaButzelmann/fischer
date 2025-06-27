import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user } from "./permissions";
import { nextCookies } from "better-auth/next-js";
// TODO: implement email sending
// import { sendEmail } from './email';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailVerification: {
    sendOnSignUp: true,
  },
  emailAndPassword: {
    minPasswordLength: 1,
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    /*
    sendResetPassword: async ({ user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: 'Reset your password',
                text: `Click the link to reset your password: ${url}`
            })
        }
            */
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
