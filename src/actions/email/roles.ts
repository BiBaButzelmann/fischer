"use server";

import { getProfileByUserId } from "@/db/repositories/profile";
import { getOpenRegistrationTournament } from "@/db/repositories/tournament";
import { RolesData } from "@/db/types/role";
import { sendRolesSelectionSummaryMail } from "@/email/roles-selection-summary";
import { tournamentPath } from "@/lib/navigation";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";

export async function sendRolesSelectionSummaryEmail(
  userId: string,
  roles: RolesData,
) {
  const profile = await getProfileByUserId(userId);
  invariant(profile != null);

  await sendRolesSelectionSummaryMail(profile.email, profile.firstName, roles);

  const tournament = await getOpenRegistrationTournament();
  redirect(tournament ? tournamentPath(tournament.slug, "/uebersicht") : "/");
}
