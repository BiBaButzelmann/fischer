import { getLatestTournament } from "@/db/repositories/tournament";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { getGamesByYearAndGroup } from "@/db/repositories/game";
import { PartienSelector } from "@/components/partien/partien-selector";
import { GamesList } from "@/components/partien/games-list";
import { updateGameResult } from "@/actions/game";
import { auth } from "@/auth/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; group?: string }>;
}) {
  const session = await auth();
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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Partien</h1>
      <div className="flex flex-col gap-1 md:gap-2">
        <PartienSelector
          selectedYear={selectedYear}
          years={years}
          selectedGroup={selectedGroup}
          groups={groups}
        />
        {games.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <GamesList
              userId={session?.user.id}
              games={games}
              onResultChange={updateGameResult}
            />
          </ScrollArea>
        ) : (
          <div>Keine Partien gefunden</div>
        )}
      </div>
    </div>
  );
}
