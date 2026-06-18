import { authWithRedirect } from "@/auth/utils";
import { Certificate } from "@/components/admin/certificates/certificate";
import { PrintButton } from "@/components/partien/print/print-button";
import { getGroupsWithTopParticipants } from "@/db/repositories/certificate";
import { getTournamentBySlug } from "@/db/repositories/tournament";
import { toLocalDateTime } from "@/lib/date";
import { notFound, redirect } from "next/navigation";
import { tournamentPath } from "@/lib/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await authWithRedirect();
  const { slug } = await params;
  if (session?.user.role !== "admin") {
    redirect(tournamentPath(slug, "/uebersicht"));
  }

  const tournament = await getTournamentBySlug(slug);
  if (!tournament) {
    notFound();
  }

  const groupsWithWinners = await getGroupsWithTopParticipants(tournament.id);

  return (
    <div className="flex gap-4 p-4 print:p-0">
      <div className="flex flex-col gap-8 print:gap-0">
        {groupsWithWinners.map((group) =>
          group.topParticipants.map((participant, index) => (
            <Certificate
              key={`${group.id}-${participant.id}`}
              participant={participant}
              group={group}
              position={index + 1}
              tournamentYear={toLocalDateTime(tournament.createdAt).year}
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
