"use server";

import { auth } from "@/auth/utils";
import { db } from "@/db/client";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import invariant from "tiny-invariant";

export async function updateUserName(firstName: string, lastName: string) {
  const session = await auth();
  invariant(session, "Session not found");

  await db
    .update(user)
    .set({ name: `${firstName} ${lastName}` })
    .where(eq(user.id, session.user.id))
    .returning();

  revalidatePath("/einstellungen");
}
