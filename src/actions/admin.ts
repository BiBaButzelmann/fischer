"use server";

import {
  hardDeleteUser,
  restoreUser,
  softDeleteUser,
} from "@/db/repositories/user";
import { revalidatePath } from "next/cache";

export async function softDeleteUserProfile(userId: string) {
  const result = await softDeleteUser(userId);
  revalidatePath("/turniere/[slug]/admin/nutzerverwaltung", "page");
  return result;
}

export async function hardDeleteUserProfile(userId: string) {
  const result = await hardDeleteUser(userId);
  revalidatePath("/turniere/[slug]/admin/nutzerverwaltung", "page");
  return result;
}

export async function restoreUserProfile(userId: string) {
  const result = await restoreUser(userId);
  revalidatePath("/turniere/[slug]/admin/nutzerverwaltung", "page");
  return result;
}
