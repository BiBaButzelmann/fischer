"use server";

import { getAllProfilesWithRolesByTournamentId } from "@/db/repositories/admin";
import { getRolesDataByProfileIdAndTournamentId } from "@/db/repositories/role";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import invariant from "tiny-invariant";
import { sendTournamentStartedMail } from "@/email/tournament-started";
import {
  getParticipantsWithProfileByGroupId,
  getParticipantWithGroupByProfileIdAndTournamentId,
} from "@/db/repositories/participant";

export async function sendTournamentStartedEmails(tournamentId: number) {
  const session = await authWithRedirect();
  invariant(session.user.role === "admin", "Unauthorized");

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");
  invariant(tournament.stage === "running", "Tournament is not running");

  const profiles = await getAllProfilesWithRolesByTournamentId(tournamentId);

  const mailsSent = await sendEmailsToProfiles(profiles, tournamentId, false);

  return { sent: mailsSent };
}

export async function sendTournamentStartedEmailsToGroup(
  tournamentId: number,
  groupId: number,
) {
  const session = await authWithRedirect();
  invariant(session.user.role === "admin", "Unauthorized");

  const tournament = await getTournamentById(tournamentId);
  invariant(tournament, "Tournament not found");
  invariant(tournament.stage === "running", "Tournament is not running");

  const groupParticipants = await getParticipantsWithProfileByGroupId(groupId);

  const profiles = groupParticipants.map((participant) => ({
    id: participant.profileId,
    firstName: participant.profile.firstName,
    lastName: participant.profile.lastName,
    email: participant.profile.email,
    phoneNumber: participant.profile.phoneNumber,
  }));

  const mailsSent = await sendEmailsToProfiles(profiles, tournamentId, true);

  return { sent: mailsSent };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendEmailsToProfiles(
  profiles: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }[],
  tournamentId: number,
  isGroupUpdate: boolean = false,
) {
  let mailsSent = 0;
  for (let i = 0; i < profiles.length; i += 2) {
    const profile1 = profiles[i];
    const profile2 = profiles[i + 1];

    const [dataProfile1, dataProfile2] = await Promise.all([
      profile1 != null ? getEmailData(tournamentId, profile1.id) : null,
      profile2 != null ? getEmailData(tournamentId, profile2.id) : null,
    ]);

    if (dataProfile1) {
      await sendTournamentStartedMail({
        name: profile1.firstName,
        email: profile1.email,
        tournamentId,
        roles: dataProfile1.roles,
        participantData: dataProfile1.participantData,
        isGroupUpdate,
      });
      mailsSent++;
    }

    if (dataProfile2) {
      await sendTournamentStartedMail({
        name: profile2.firstName,
        email: profile2.email,
        tournamentId,
        roles: dataProfile2.roles,
        participantData: dataProfile2.participantData,
        isGroupUpdate,
      });
      mailsSent++;
    }

    await sleep(1000);
  }

  return mailsSent;
}

async function getEmailData(tournamentId: number, profileId: number) {
  const roles = await getRolesDataByProfileIdAndTournamentId(
    profileId,
    tournamentId,
  );

  const participantData =
    roles.participant != null
      ? await getParticipantData(tournamentId, profileId)
      : undefined;

  return {
    roles,
    participantData,
  };
}

async function getParticipantData(tournamentId: number, profileId: number) {
  const participantWithGroup =
    await getParticipantWithGroupByProfileIdAndTournamentId(
      profileId,
      tournamentId,
    );

  invariant(participantWithGroup, `Participant ${profileId} not found`);
  invariant(
    participantWithGroup.group,
    `Participant ${profileId} is not assigned to a group`,
  );
  invariant(
    participantWithGroup.group.group,
    `Group not found for participant ${profileId}`,
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
    groupId: groupInfo.id,
    groupName: groupInfo.groupName,
    dayOfWeek: groupInfo.dayOfWeek,
    participants: groupParticipants,
  };
}
