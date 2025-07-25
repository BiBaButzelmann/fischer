import { authWithRedirect } from "@/auth/utils";
import { db } from "@/db/client";
import { group } from "@/db/schema/group";
import { count, eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export async function generateFideReport(groupId: number, month: number) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = await db.query.group.findFirst({
    where: (group, { eq }) => eq(group.id, groupId),
    with: {
      participants: {
        with: {
          participant: {
            with: {
              profile: {
                columns: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      tournament: true,
      games: true,
    },
  });
  invariant(data, "Group not found");
  invariant(
    data.tournament.organizerProfileId != null,
    "Organizer profile id not found",
  );

  const countResult = await db
    .select({ count: count() })
    .from(group)
    .where(eq(group.tournamentId, data.tournament.id));

  const organizerProfile = await db.query.profile.findFirst({
    where: (profile, { eq }) =>
      eq(profile.id, data.tournament.organizerProfileId!),
    columns: {
      firstName: true,
      lastName: true,
    },
  });
  invariant(organizerProfile, "Organizer profile not found");

  // 012
  const fideTournamentName = `${data.tournament.name} - ${data.groupName}`;
  // 022
  const location = data.tournament.location;
  // 032
  const fideNation = "GER";
  // 042
  const startDate = data.tournament.startDate;
  // 052
  const endDate = data.tournament.endDate;
  // 062 / 072?
  const groupsCount = countResult[0].count;
  // 092
  const tournamentType = "Individual round robin";
  // 102
  const organizerName = `${organizerProfile.firstName} ${organizerProfile.lastName}`;
  // 122
  const tournamentTimeLimit = data.tournament.timeLimit;

  // 132
  const datesPlayed = Array.from(
    data.games.reduce((acc, game) => {
      return acc.add(game.scheduled);
    }, new Set<Date>()),
  );

  const tableData: TableEntry[] = [];
}

const columnIdentifiers: Record<
  Exclude<keyof TableEntry, "results">,
  string
> = {
  index: "DDD",
  startingGroupPosition: "SSSS",
  gender: "s",
  title: "TTT",
  name: "NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
  fideRating: "RRRR",
  fideNation: "FFF",
  fideId: "IIIIIIIIIII",
  birthYear: "BBBB/BB/BB",
  currentPoints: "PPPP",
  currentGroupPosition: "RRRR",
};
