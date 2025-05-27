import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, user } from "./permissions";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
});
