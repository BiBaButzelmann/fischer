import { getLatestTournament } from "@/db/repositories/tournament";
import { getGroupsByTournamentId } from "@/db/repositories/group";
import { PartienSelector } from "@/components/partien/partien-selector";

export default async function Page() {
  const latestTournament = await getLatestTournament();
  if (!latestTournament) {
    return <div>Kein Turnier gefunden</div>;
  }

  const latestYear = new Date(latestTournament.startDate).getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (latestYear - i).toString(),
  );

  const groups = await getGroupsByTournamentId(latestTournament.id);

  return (
    <div className="">
      <PartienSelector years={years} groups={groups} />
    </div>
  );
}
