"use server";

import { getProfileByUserId } from "@/db/repositories/profile";
import { RolesData } from "@/db/types/role";
import { sendRolesSelectionSummaryMail } from "@/email/roles-selection-summary";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";

export async function sendRolesSelectionSummaryEmail(
  userId: string,
  roles: RolesData,
) {
  const profile = await getProfileByUserId(userId);
  invariant(profile != null);

  await sendRolesSelectionSummaryMail(profile.email, profile.firstName, roles);

  redirect("/uebersicht");
}
