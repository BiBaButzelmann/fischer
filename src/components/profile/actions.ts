"use server";

import { db } from "@/db/client";
import { ProfileFormData, profileFormDataSchema } from "./schema";
import { profile } from "@/db/schema/profile";
import { auth } from "@/auth";
import { headers } from "next/headers";
import invariant from "tiny-invariant";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: ProfileFormData) {
  const data = profileFormDataSchema.parse(formData);

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // TODO: find better way to make sure session is not null
  invariant(session, "Session not found");

  await db
    .update(profile)
    .set({
      name: data.name,
    })
    .where(eq(profile.userId, session.user.id));

  revalidatePath("/profile");
}
