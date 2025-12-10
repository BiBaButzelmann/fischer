import { db } from "@/db/client";
import { calculateStandings } from "@/lib/standings";
import { filterRelevantGames } from "@/lib/relevant-games";
import { getCompletedGames, getParticipantsInGroup } from "./game";
import type { GroupWithTopParticipants } from "@/db/types/certificate";

export async function getGroupsWithTopParticipants(
  tournamentId: number,
): Promise<GroupWithTopParticipants[]> {
  const groups = await db.query.group.findMany({
    where: (group, { eq }) => eq(group.tournamentId, tournamentId),
    orderBy: (group, { asc }) => [asc(group.groupName)],
  });

  const groupsWithTopParticipants = await Promise.all(
    groups.map(async (group) => {
      const participants = await getParticipantsInGroup(group.id);
      const games = await getCompletedGames(group.id);
      const relevantGames = filterRelevantGames(games, participants);
      const standings = calculateStandings(relevantGames, participants);

      const topThree = standings.slice(0, 3).map((standing) => {
        const participant = participants.find(
          (p) => p.id === standing.participantId,
        );
        return {
          ...participant!,
          points: standing.points,
          gamesPlayed: standing.gamesPlayed,
        };
      });

      return {
        id: group.id,
        groupName: group.groupName,
        topParticipants: topThree,
      };
    }),
  );

  return groupsWithTopParticipants;
}
