import { db } from "@/db/client";
import { ParticipantWithName } from "@/db/types/participant";
import invariant from "tiny-invariant";
import { EditGroupsGrid } from "./edit-groups-grid";

// TODO: currently it generates on demand, but it should be generated
// on button click and loaded from the database if possible
export async function EditGroups() {
  const activeTournament = await db.query.tournament.findFirst({
    where: (tournament, { gte }) => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return gte(tournament.startDate, startOfYear);
    },
  });
  invariant(activeTournament, "No active tournament found");

  const participants = await db.query.participant.findMany({
    // TODO: replace with active tournament id
    // This is just a placeholder for demonstration purposes
    where: (participant, { eq }) => eq(participant.tournamentId, 1),
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
