import { authWithRedirect } from "@/auth/utils";
import { Certificate } from "@/components/admin/certificates/certificate";
import { PrintButton } from "@/components/partien/print/print-button";
import { getGroupsWithTopParticipants } from "@/db/repositories/certificate";
import { getLatestTournament } from "@/db/repositories/tournament";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";

export default async function Page() {
  const session = await authWithRedirect();
  if (session?.user.role !== "admin") {
    redirect("/uebersicht");
  }

  const tournament = await getLatestTournament();
  invariant(tournament != null, "No active tournament found");

  const groupsWithWinners = await getGroupsWithTopParticipants(tournament.id);

  return (
    <div className="flex gap-4 p-4 print:p-0">
      <div className="flex flex-col gap-8">
        {groupsWithWinners.map((group) =>
          group.topParticipants.map((participant, index) => (
            <Certificate
              key={`${group.id}-${participant.id}`}
              participant={participant}
              group={group}
              position={index + 1}
              tournamentYear={new Date(tournament.createdAt).getFullYear()}
            />
          )),
        )}
      </div>
      <div className="print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
