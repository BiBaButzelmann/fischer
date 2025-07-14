import { authWithRedirect } from "@/auth/utils";
import { EditGroups } from "@/components/admin/tournament/edit-groups";
import { getLatestTournament } from "@/db/repositories/tournament";

export default async function Page() {
  await authWithRedirect();
  const tournament = await getLatestTournament();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gruppenverwaltung
        </h1>
      </div>
      <div>{tournament ? <EditGroups tournament={tournament} /> : null}</div>
    </div>
  );
}
