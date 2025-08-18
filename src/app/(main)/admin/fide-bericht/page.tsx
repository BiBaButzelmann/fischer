import { auth } from "@/auth/utils";
import { GenerateFideReport } from "@/components/admin/fide-report/generate-fide-report";
import {
  getAllGroupNamesByTournamentId,
  getGamesInMonth,
} from "@/db/repositories/game";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string; month?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    redirect("/uebersicht");
  }

  const { groupId, month } = await searchParams;

  const tournament = await getLatestTournament();
  if (!tournament) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fide Bericht</h1>
        <p>Kein aktives Turnier gefunden.</p>
      </div>
    );
  }

  const [groups, isDisabled] = await Promise.all([
    getAllGroupNamesByTournamentId(tournament.id),
    isGenerationDisabled(groupId, month),
  ]);

  return (
    <GenerateFideReport
      groups={groups}
      selectedGroupId={groupId}
      selectedMonth={month}
      isDisabled={isDisabled}
    />
  );
}

async function isGenerationDisabled(
  groupIdParam: string | undefined,
  monthParam: string | undefined,
) {
  if (!groupIdParam || !monthParam) return true;

  const groupId = parseInt(groupIdParam);
  const month = parseInt(monthParam);

  const games = await getGamesInMonth(groupId, month);
  return games.some((game) => game.result == null);
}
