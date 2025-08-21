"use server";

import { getContributorsWithEmailByTournamentId } from "@/db/repositories/admin";
import { sendTournamentStartedMail } from "@/email/tournament-started";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import invariant from "tiny-invariant";

export async function sendTournamentStartedEmails(tournamentId: number) {
  await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");
  invariant(tournament.stage === "running", "Tournament is not running");

  const contributors =
    await getContributorsWithEmailByTournamentId(tournamentId);

  const emailPromises = contributors.map((person) =>
    sendTournamentStartedMail(person.email, person.firstName),
  );

  await Promise.all(emailPromises);

  return { sent: contributors.length };
}
