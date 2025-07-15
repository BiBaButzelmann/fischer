import { authWithRedirect } from "@/auth/utils";
import { EditGroups } from "@/components/admin/groups/edit-groups";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await authWithRedirect();

  if (session.user.role !== "admin") {
    redirect("/uebersicht");
  }

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
