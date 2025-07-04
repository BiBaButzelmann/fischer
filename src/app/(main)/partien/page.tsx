import { getLatestTournament } from "@/db/repositories/tournament";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { getGamesByYearAndGroup } from "@/db/repositories/game";
import { PartienSelector } from "@/components/partien/partien-selector";
import { GamesList } from "@/components/partien/games-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; group?: string }>;
}) {
  const { year, group } = await searchParams;

  const latestTournament = await getLatestTournament();
  if (!latestTournament) {
    return <div>Kein Turnier gefunden</div>;
  }

  const latestYear = new Date(latestTournament.startDate).getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (latestYear - i).toString(),
  );
  const groups = await getGroupsByTournamentId(latestTournament.id);

  const selectedYear = year ?? years[0];
  const selectedGroup = group ?? groups[0]?.groupNumber.toString();

  const games = await getGamesByYearAndGroup(selectedYear, selectedGroup);

  return (
    <div className="space-y-6">
      <PartienSelector
        selectedYear={selectedYear}
        years={years}
        selectedGroup={selectedGroup}
        groups={groups}
      />
      {games.length > 0 ? (
        <GamesList games={games} />
      ) : (
        <div>Keine Partien gefunden</div>
      )}
    </div>
  );
}
