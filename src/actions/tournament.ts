"use server";

import { db } from "@/db/client";
import { tournament } from "@/db/schema/tournament";
import { revalidatePath } from "next/cache";
import { tournamentWeek } from "@/db/schema/tournamentWeek";
import { z } from "zod";
import { createTournamentFormSchema } from "@/schema/tournament";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { auth } from "@/auth";

export async function createTournament(
  formData: z.infer<typeof createTournamentFormSchema>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = createTournamentFormSchema.parse(formData);

  const context = await auth.$context;
  const hashedPassword = await context.password.hash(data.pgnViewerPassword);

  const newTournament: typeof tournament.$inferInsert = {
    name: "TODO: HSK Klubturnier",
    allClocksDigital: true,
    club: data.clubName,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    email: data.email,
    location: data.location,
    numberOfRounds: data.numberOfRounds,
    phone: data.phone,
    softwareUsed: data.softwareUsed,
    timeLimit: data.timeLimit,
    tieBreakMethod: data.tieBreakMethod,
    type: data.tournamentType,
    organizerProfileId: parseInt(data.organizerProfileId),
    pgnViewerPassword: hashedPassword,
  };
  const inserted = await db
    .insert(tournament)
    .values(newTournament)
    .returning({ id: tournament.id });
  const insertedTournamentId = inserted[0].id;

  const newWeeks = data.selectedCalendarWeeks.map(
    (week) =>
      ({
        tournamentId: insertedTournamentId,
        status: week.status,
        weekNumber: week.weekNumber,
        refereeNeededTuesday: week.tuesday.refereeNeeded,
        refereeNeededThursday: week.thursday.refereeNeeded,
        refereeNeededFriday: week.friday.refereeNeeded,
      }) satisfies typeof tournamentWeek.$inferInsert,
  );
  await db.insert(tournamentWeek).values(newWeeks);

  revalidatePath("/admin/tournament");
}
