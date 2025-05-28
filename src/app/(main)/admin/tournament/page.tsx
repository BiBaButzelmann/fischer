import { auth } from "@/auth";
import CreateTournament from "@/components/admin/tournament/create-tournament";
import { db } from "@/db/client";
import { address } from "@/db/schema/address";
import { user } from "@/db/schema/auth";
import { profile } from "@/db/schema/profile";
import { eq, getTableColumns } from "drizzle-orm";
import { headers } from "next/headers";

export default async function Page() {
  // TODO: improve this
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role != "admin") {
    return null;
  }

  const activeTournament = await db.query.tournament.findFirst({
    where: (tournament, { gte }) => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return gte(tournament.startDate, startOfYear);
    },
  });

  // TODO: parallelize queries
  const adminProfiles = await db
    .select({
      ...getTableColumns(profile),
      address: getTableColumns(address),
    })
    .from(profile)
    .leftJoin(user, eq(profile.userId, user.id))
    .leftJoin(address, eq(profile.addressId, address.id))
    .where(eq(user.role, "admin"));

  return (
    <div>
      {activeTournament && <p>turnier läuft</p>}
      <CreateTournament profiles={adminProfiles} />
    </div>
  );
}
