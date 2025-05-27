import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  plugins: [
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
