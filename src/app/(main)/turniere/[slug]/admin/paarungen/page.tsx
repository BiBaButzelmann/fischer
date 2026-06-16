import { authWithRedirect } from "@/auth/utils";
import { PairingContainer } from "@/components/admin/pairings/pairing-container";
import { getGroupsWithParticipantsAndGamesByTournamentId } from "@/db/repositories/group";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { tournamentPath } from "@/lib/navigation";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await authWithRedirect();
  const { slug } = await params;

  if (session.user.role !== "admin") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
        <p className="text-gray-600">Kein aktives Turnier gefunden.</p>
      </div>
    );
  }
  const groupsData = await getGroupsWithParticipantsAndGamesByTournamentId(
    tournament.id,
  );

  if (groupsData.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
        <div className="text-center py-8 text-gray-500">
          Keine Gruppen gefunden. Erstelle zuerst Gruppen.
        </div>
      </div>
    );
  }

  const groups = groupsData.map((g) => ({
    ...g,
    participants: g.participants.map((p) => p.participant),
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paarungen</h1>
      </div>
      <PairingContainer tournamentId={tournament.id} groups={groups} />
    </div>
  );
}
