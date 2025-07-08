"use server";

import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { profile } from "@/db/schema/profile";
import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  data: Partial<InferInsertModel<typeof profile>>,
) {
  const session = await authWithRedirect();

  await db
    .update(profile)
    .set(data)
    .where(eq(profile.userId, session.user.id))
    .returning();

  revalidatePath("/einstellungen");
}
