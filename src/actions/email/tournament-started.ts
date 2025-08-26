"use server";

import { getAllProfilesWithRolesByTournamentId } from "@/db/repositories/admin";
import { getParticipantsWithProfileByGroupId } from "@/db/repositories/participant";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { getParticipantWithGroupByProfileIdAndTournamentId } from "@/db/repositories/participant";
import { sendTournamentStartedMail } from "@/email/tournament-started";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import invariant from "tiny-invariant";

export async function sendTournamentStartedEmails(tournamentId: number) {
  await authWithRedirect();

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");
  invariant(tournament.stage === "running", "Tournament is not running");

  const profiles = await getAllProfilesWithRolesByTournamentId(tournamentId);

  const emailPromises = profiles.map(async (profile) => {
    const roles = await getRolesDataByProfileIdAndTournamentId(
      profile.id,
      tournamentId,
    );

    return sendTournamentStartedMail({
      name: profile.firstName,
      email: profile.email,
      roles,
      tournamentId,
      participantGroup: roles.participant
        ? await (async () => {
            const participantWithGroup =
              await getParticipantWithGroupByProfileIdAndTournamentId(
                profile.id,
                tournamentId,
              );

            invariant(
              participantWithGroup,
              `Participant ${profile.firstName} ${profile.lastName} not found`,
            );
            invariant(
              participantWithGroup.group,
              `Participant ${profile.firstName} ${profile.lastName} is not assigned to a group`,
            );
            invariant(
              participantWithGroup.group.group,
              `Group not found for participant ${profile.firstName} ${profile.lastName}`,
            );
            const groupInfo = participantWithGroup.group.group;
            invariant(
              groupInfo.dayOfWeek,
              `Group ${groupInfo.groupName} has no matchday assigned`,
            );

            const groupParticipants = await getParticipantsWithProfileByGroupId(
              groupInfo.id,
            );

            return {
              groupName: groupInfo.groupName,
              dayOfWeek: groupInfo.dayOfWeek,
              groupId: groupInfo.id,
              participants: groupParticipants,
            };
          })()
        : undefined,
    });
  });

  await Promise.all(emailPromises);

  return { sent: profiles.length };
}
