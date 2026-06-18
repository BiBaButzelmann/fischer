import { authWithRedirect } from "@/auth/utils";
import { EditGroups } from "@/components/admin/groups/edit-groups";
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
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gruppenverwaltung
        </h1>
      </div>
      <div>
        {tournament ? (
          <EditGroups tournament={tournament} />
        ) : (
          <p>Kein Turnier gefunden</p>
        )}
      </div>
    </div>
  );
}
