"use server";

import { db } from "@/db/client";
import { tournament } from "@/db/schema/tournament";
import {
  CreateTournamentFormData,
  createTournamentFormDataSchema,
} from "@/components/admin/tournament/schema";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { tournamentWeek } from "@/db/schema/tournamentWeek";

// TODO: authentication / authorization
export async function createTournament(formData: CreateTournamentFormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const data = createTournamentFormDataSchema.parse(formData);

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
