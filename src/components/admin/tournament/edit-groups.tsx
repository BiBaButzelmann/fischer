import { db } from "@/db/client";
import { EditGroupsGrid } from "./edit-groups-grid";
import { Tournament } from "@/db/types/tournament";

// TODO: currently it generates on demand, but it should be generated
// on button click and loaded from the database if possible
export async function EditGroups({ tournament }: { tournament: Tournament }) {
  const participants = await db.query.participant.findMany({
    where: (participant, { eq }) => eq(participant.tournamentId, tournament.id),
    with: {
      profile: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: (participant, { desc, sql }) => [
      sql`${participant.fideRating} IS NULL`,
      desc(participant.fideRating),
    ],
  });

  return <EditGroupsGrid participants={participants} />;
}
