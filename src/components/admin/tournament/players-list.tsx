import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { db } from "@/db/client";

export async function PlayersList() {
  const players = await db.query.participant.findMany({
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

  return (
    <div className="flex flex-col gap-2">
      {players.map((player) => (
        <Card key={player.id} className="w-full">
          <CardHeader className="px-4 py-2">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold flex-grow">{player.profile.name}</h2>
              {player.fideRating ? (
                <Badge>FIDE {player.fideRating}</Badge>
              ) : null}
              {player.dwzRating ? (
                <Badge variant="secondary">DWZ {player.dwzRating}</Badge>
              ) : null}
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
