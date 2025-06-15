import { Card, CardHeader } from "@/components/ui/card";
import { db } from "@/db/client";
import { ParticipantEntry } from "./participant-entry";

export async function ParticipantsList() {
  const participants = await db.query.participant.findMany({
    // TODO: replace with active tournament id
    // This is just a placeholder for demonstration purposes
    where: (participant, { eq }) => eq(participant.tournamentId, 1),
    with: {
      profile: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: (participant, { desc, sql }) => [
      sql`${participant.fideRating} IS NULL`,
      desc(participant.fideRating),
    ],
  });

  return (
    <div className="flex flex-col gap-2">
      {participants.map((p) => (
        <Card key={p.id} className="w-full">
          <CardHeader className="px-4 py-2">
            <ParticipantEntry participant={p} />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
