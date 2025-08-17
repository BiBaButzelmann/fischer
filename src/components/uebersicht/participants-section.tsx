import { getParticipantsByTournamentId } from "@/db/repositories/participant";
import { Participants } from "../participants/participants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export async function ParticipantsSection({
  tournamentId,
  profileId,
}: {
  tournamentId: number;
  profileId?: number;
}) {
  const participants = await getParticipantsByTournamentId(tournamentId);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Teilnehmerliste</CardTitle>
        <CardDescription>
          Aktuelle Liste der{" "}
          <strong className="text-base font-bold text-foreground">
            {participants.length}
          </strong>{" "}
          angemeldeten Spieler.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-[510px] w-full pr-3">
          <Participants profileId={profileId} participants={participants} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
