"use server";

import { db } from "@/db/client";
import { tournament } from "@/db/schema/tournament";
import { revalidatePath } from "next/cache";
import { tournamentWeek } from "@/db/schema/tournamentWeek";
import { z } from "zod";
import {
  createTournamentFormSchema,
  updateTournamentFormSchema,
} from "@/schema/tournament";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { TournamentStage } from "@/db/types/tournament";

export async function createTournament(
  formData: z.infer<typeof createTournamentFormSchema>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = createTournamentFormSchema.parse(formData);

  // Ensure password is provided for new tournaments
  if (!data.pgnViewerPassword || data.pgnViewerPassword.length === 0) {
    throw new Error("PGN Viewer Passwort ist für neue Turniere erforderlich");
  }

  const context = await auth.$context;
  const hashedPassword = await context.password.hash(data.pgnViewerPassword);

  const newTournament: typeof tournament.$inferInsert = {
    name: "Klubturnier 2025",
    allClocksDigital: true,
    club: data.clubName,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    endRegistrationDate: new Date(data.endRegistrationDate),
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

export async function updateTournament(
  tournamentId: number,
  formData: z.infer<typeof updateTournamentFormSchema>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = updateTournamentFormSchema.parse(formData);

  const updateData: Partial<typeof tournament.$inferInsert> = {
    club: data.clubName,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    endRegistrationDate: new Date(data.endRegistrationDate),
    email: data.email,
    location: data.location,
    numberOfRounds: data.numberOfRounds,
    phone: data.phone,
    softwareUsed: data.softwareUsed,
    timeLimit: data.timeLimit,
    tieBreakMethod: data.tieBreakMethod,
    type: data.tournamentType,
    organizerProfileId: parseInt(data.organizerProfileId),
    allClocksDigital: data.allClocksDigital,
  };

  // Only update password if a new one is provided
  if (data.pgnViewerPassword && data.pgnViewerPassword.length > 0) {
    const context = await auth.$context;
    const hashedPassword = await context.password.hash(data.pgnViewerPassword);
    updateData.pgnViewerPassword = hashedPassword;
  }

  await db
    .update(tournament)
    .set(updateData)
    .where(eq(tournament.id, tournamentId));

  await db
    .delete(tournamentWeek)
    .where(eq(tournamentWeek.tournamentId, tournamentId));

  const newWeeks = data.selectedCalendarWeeks.map(
    (week) =>
      ({
        tournamentId,
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

export async function updateTournamentStage(
  tournamentId: number,
  stage: TournamentStage,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  await db
    .update(tournament)
    .set({ stage })
    .where(eq(tournament.id, tournamentId));

  revalidatePath("/admin/tournament");
  revalidatePath("/uebersicht");
}
