"use server";

import { authWithRedirect } from "@/auth/utils";
import { getNonDefaultClubParticipantsWithEmailByTournamentId } from "@/db/repositories/admin";
import { getActiveTournament } from "@/db/repositories/tournament";
import { sendEntryFeeReminderEmail } from "@/email/entryFeeReminder";
import invariant from "tiny-invariant";

export async function sendEntryFeeReminderEmails() {
  const session = await authWithRedirect();

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const tournament = await getActiveTournament();
  invariant(tournament, "No active tournament found");

  const participants =
    await getNonDefaultClubParticipantsWithEmailByTournamentId(tournament.id);

  const unpaidParticipants = participants.filter(
    (participant) => !participant.entryFeePayed,
  );

  if (unpaidParticipants.length === 0) {
    return { sent: 0, message: "Keine unbezahlten Teilnehmer gefunden" };
  }

  const emailPromises = unpaidParticipants.map(async (participant) => {
    return sendEntryFeeReminderEmail(
      participant.profile.email,
      participant.profile.firstName,
      participant.profile.lastName,
    );
  });

  await Promise.all(emailPromises);

  return {
    sent: unpaidParticipants.length,
    message: `E-Mails an ${unpaidParticipants.length} Teilnehmer gesendet`,
  };
}
