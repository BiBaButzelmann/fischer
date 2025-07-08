import { Tournament } from "@/db/types/tournament";

type Props = {
  tournament: Tournament;
};

export function TournamentRunning({ tournament }: Props) {
  return (
    <>
      <p className="mt-2 text-lg text-muted-foreground">
        Das Turnier läuft derzeit! Viel Erfolg bei deinen Spielen.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Enddatum:{" "}
        <span className="font-semibold text-foreground">
          {tournament.endDate.toLocaleDateString("de-DE")}
        </span>
        .
      </p>
    </>
  );
}
