import { Card, CardHeader } from "@/components/ui/card";
import { ParticipantEntry } from "./participant-entry";
import { getParticipantsByTournamentId } from "@/db/repositories/participant";

export async function ParticipantsList() {
  // TODO: dynamic tournament ID
  const participants = await getParticipantsByTournamentId(1);

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
