import { auth } from "@/auth/utils";
import { GenerateFideReport } from "@/components/admin/fide-report/generate-fide-report";
import { getAllGroupNamesByTournamentId } from "@/db/repositories/game";
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

  const groups = await getAllGroupNamesByTournamentId(tournament.id);

  return (
    <GenerateFideReport
      groups={groups}
      selectedGroupId={groupId}
      selectedMonth={month}
    />
  );
}
