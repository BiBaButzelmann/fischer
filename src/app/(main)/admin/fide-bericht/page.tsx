import { auth } from "@/auth/utils";
import { GenerateFideReportButton } from "@/components/admin/fide-report/generate-fide-report-button";
import { GenerateFideReportSelector } from "@/components/admin/fide-report/generate-fide-report-selector";
import { UncompletedGames } from "@/components/admin/fide-report/uncompleted-games";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  getAllGroupNamesByTournamentId,
  getUncompletedGamesInMonth,
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

  const groups = await getAllGroupNamesByTournamentId(tournament.id);

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Elo-Auswertung</CardTitle>
          <CardDescription>
            Wählen Sie eine Gruppe und einen Monat aus, um die Elo-Auswertung
            als .txt-Datei zu generieren und herunterzuladen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateFideReportSelector
            groups={groups}
            selectedGroupId={groupId}
            selectedMonth={month}
          />
        </CardContent>
        <CardFooter>
          <ButtonSection
            tournamentId={tournament.id}
            selectedGroupId={groupId}
            selectedMonth={month}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

type ButtonSectionProps = {
  tournamentId: number;
  selectedGroupId: string | undefined;
  selectedMonth: string | undefined;
};
async function ButtonSection({
  tournamentId,
  selectedGroupId,
  selectedMonth,
}: ButtonSectionProps) {
  if (selectedGroupId == null || selectedMonth == null) {
    return (
      <GenerateFideReportButton
        isDisabled
        selectedGroupId={selectedGroupId}
        selectedMonth={selectedMonth}
      />
    );
  }

  const groupId = parseInt(selectedGroupId);
  const month = parseInt(selectedMonth);

  const uncompletedGames = await getUncompletedGamesInMonth(groupId, month);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <UncompletedGames
        tournamentId={tournamentId}
        groupId={groupId}
        games={uncompletedGames}
      />
      <GenerateFideReportButton
        selectedGroupId={selectedGroupId}
        selectedMonth={selectedMonth}
        isDisabled={uncompletedGames.length > 0}
      />
    </div>
  );
}
