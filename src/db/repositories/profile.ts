import { getTableColumns, eq } from "drizzle-orm";
import { db } from "../client";
import { profile } from "../schema/profile";
import { user } from "../schema/auth";

export async function getProfileByUserId(userId: string) {
  return await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, userId),
  });
}

export async function getProfileByUserRole(role: "admin" | "user") {
  return await db
    .select(getTableColumns(profile))
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .where(eq(user.role, role));
}
