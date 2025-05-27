import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import {
  admin as adminPlugin,
  createAuthMiddleware,
} from "better-auth/plugins";
import { ac, admin, user } from "./permissions";
import { profile } from "./db/schema/profile";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  databaseHooks: {
    user: {
      create: {
        async after(user, context) {
          await db.insert(profile).values({
            userId: user.id,
            name: user.name,
          });
        },
      },
    },
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
