import { EditGroupsGrid } from "../groups/edit-groups-grid";
import { Tournament } from "@/db/types/tournament";
import { db } from "@/db/client";
import { participant, participantGroup } from "@/db/schema/participant";
import { eq, and, isNull, getTableColumns } from "drizzle-orm";
import { profile } from "@/db/schema/profile";
import { type GridGroup } from "./types";

export async function EditGroups({ tournament }: { tournament: Tournament }) {
  // const groupsData = await getGroupsWithParticipantsByTournamentId(
  //   tournament.id,
  // );
  // const unassignedParticipants = await getUnassignedParticipantsByTournamentId(
  //   tournament.id,
  // );

  // const groupsData = await db
  //   .select({
  //     id: group.id,
  //     groupNumber: group.groupNumber,
  //     groupName: group.groupName,
  //     matchDay: group.matchDay,
  //     participants: {
  //       profileId: participant.profileId,
  //       firstName: profile.firstName,
  //       lastName: profile.lastName,
  //       groupPosition: participantGroup.groupPosition,
  //     }
  //   })
  //   .from(participantGroup)
  //   .innerJoin(group, eq(participantGroup.groupId, group.id))
  //   .innerJoin(participant, eq(participantGroup.participantId, participant.id))
  //   .innerJoin(profile, eq(participant.profileId, profile.id))
  //   .where(eq(group.tournamentId, tournament.id));

  const groupsData = await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournament.id),
    with: {
      participants: {
        orderBy: (participant, { asc }) => [asc(participant.groupPosition)],
        with: {
          participant: {
            with: {
              profile: {
                columns: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });
  console.log("groupsData", groupsData);

  const unassignedParticipants = await db
    .select({
      ...getTableColumns(participant),
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    })
    .from(participant)
    .leftJoin(
      participantGroup,
      eq(participant.id, participantGroup.participantId),
    )
    .innerJoin(profile, eq(participant.profileId, profile.id))
    .where(
      and(
        eq(participant.tournamentId, tournament.id),
        isNull(participantGroup.participantId),
      ),
    );

  const groups = groupsData.map(
    (g) =>
      ({
        id: g.id,
        isNew: false,
        groupName: g.groupName,
        groupNumber: g.groupNumber,
        matchDay: g.matchDay,
        participants: g.participants.map(({ groupPosition, participant }) => ({
          groupPosition: groupPosition,
          ...participant,
        })),
      }) as GridGroup,
  );

  return (
    <EditGroupsGrid
      tournamentId={tournament.id}
      groups={groups}
      unassignedParticipants={unassignedParticipants}
    />
  );
}
