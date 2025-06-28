import { Tournament } from "@/db/types/tournament";
import { Pairings } from "./pairings";
import { GeneratePairings } from "./generate-pairings";
import { getGroupsWithGamesByTournamentId } from "@/db/repositories/group";

export async function PairingsOverview({
  tournament,
}: {
  tournament: Tournament;
}) {
  const groupGames = await getGroupsWithGamesByTournamentId(tournament.id);
  return (
    <div className="flex gap-2">
      <div className="flex-grow">
        <Pairings groups={groupGames} />
      </div>
      <GeneratePairings tournamentId={tournament.id} />
    </div>
  );
}
