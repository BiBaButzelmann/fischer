import { getTournamentWeeksByTournamentId } from "@/db/repositories/tournamentWeek";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { TournamentWeeks } from "./registration/tournament-weeks";

export async function TournamentWeeksSection({
  tournamentId,
}: {
  tournamentId: number;
}) {
  const tournamentWeeks = await getTournamentWeeksByTournamentId(tournamentId);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Zeitplan</CardTitle>
        <CardDescription>
          Gesamtübersicht der Spieltermine. An Feiertagen kann nicht gespielt
          werden.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="w-full pb-3">
          <TournamentWeeks tournamentWeeks={tournamentWeeks} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
