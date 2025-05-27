"use server";

import { db } from "@/db/client";
import { ProfileFormData, profileFormDataSchema } from "./schema";
import { profile } from "@/db/schema/profile";
import { auth } from "@/auth";
import { headers } from "next/headers";
import invariant from "tiny-invariant";
import { eq } from "drizzle-orm";
import { address } from "@/db/schema/address";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: ProfileFormData) {
  const data = profileFormDataSchema.parse(formData);

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // TODO: find better way to make sure session is not null
  invariant(session, "Session not found");

  const currentProfile = await db
    .select({ addressId: profile.addressId })
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  let addressId: number | null = currentProfile.addressId;
  if (currentProfile.addressId == null) {
    const newAddress = await db
      .insert(address)
      .values({
        name: data.adressName,
        coLine: data.addressCoLine,
        street: data.addressStreet,
        postalCode: data.addressPostalCode,
        city: data.addressCity,
      })
      .returning({ id: address.id })
      .then((rows) => rows[0]);

    addressId = newAddress.id;
  } else {
    await db
      .update(address)
      .set({
        name: data.adressName,
        coLine: data.addressCoLine,
        street: data.addressStreet,
        postalCode: data.addressPostalCode,
        city: data.addressCity,
      })
      .where(eq(address.id, currentProfile.addressId));
  }

  await db
    .update(profile)
    .set({
      name: data.name,
      fideId: parseInt(data.fideId),
      addressId: addressId,
    })
    .where(eq(profile.userId, session.user.id));

  revalidatePath("/profile");
}
