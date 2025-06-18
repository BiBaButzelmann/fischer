import { db } from "@/db/client";
import { EditGroupsGrid } from "./edit-groups-grid";
import { Tournament } from "@/db/types/tournament";

// TODO: currently it generates on demand, but it should be generated
// on button click and loaded from the database if possible
export async function EditGroups({ tournament }: { tournament: Tournament }) {
  const groups = await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournament.id),
    with: {
      participants: {
        orderBy: (participant, { asc }) => [asc(participant.groupPosition)],
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
    orderBy: (group, { asc }) => [asc(group.groupNumber)],
  });

  const unassignedParticipants = await db.query.participant.findMany({
    where: (participant, { eq, and, isNull }) =>
      and(
        eq(participant.tournamentId, tournament.id),
        isNull(participant.groupId),
      ),
    with: {
      profile: {
        columns: {
          name: true,
        },
      },
    },
  });

  return (
    <EditGroupsGrid
      groups={groups}
      unassignedParticipants={unassignedParticipants}
    />
  );
}
