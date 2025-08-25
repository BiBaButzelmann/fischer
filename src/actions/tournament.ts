"use server";

import { db } from "@/db/client";
import { tournament } from "@/db/schema/tournament";
import { revalidatePath } from "next/cache";
import { tournamentWeek } from "@/db/schema/tournamentWeek";
import { z } from "zod";
import { createTournamentFormSchema } from "@/schema/tournament";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { eq } from "drizzle-orm";
import { TournamentStage } from "@/db/types/tournament";
import { matchday } from "@/db/schema/matchday";
import { isHoliday } from "@/lib/holidays";
import { getBerlinDateTime } from "@/lib/date";

export async function createTournament(
  formData: z.infer<typeof createTournamentFormSchema>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = createTournamentFormSchema.parse(formData);

  await db.transaction(async (tx) => {
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
    };
    const inserted = await tx
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
        }) satisfies typeof tournamentWeek.$inferInsert,
    );

    const insertedTournamentWeeks = await tx
      .insert(tournamentWeek)
      .values(newWeeks)
      .returning();

    const matchDays = getMatchDays(
      insertedTournamentId,
      insertedTournamentWeeks,
      data.selectedCalendarWeeks,
    );

    await tx.insert(matchday).values(matchDays);
  });

  revalidatePath("/admin/tournament");
}

export async function updateTournament(
  tournamentId: number,
  formData: z.infer<typeof createTournamentFormSchema>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = createTournamentFormSchema.parse(formData);

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

  await db.transaction(async (tx) => {
    await tx
      .update(tournament)
      .set(updateData)
      .where(eq(tournament.id, tournamentId));

    await tx
      .delete(tournamentWeek)
      .where(eq(tournamentWeek.tournamentId, tournamentId));

    const newWeeks = data.selectedCalendarWeeks.map(
      (week) =>
        ({
          tournamentId,
          status: week.status,
          weekNumber: week.weekNumber,
        }) satisfies typeof tournamentWeek.$inferInsert,
    );
    const insertedTournamentWeeks = await tx
      .insert(tournamentWeek)
      .values(newWeeks)
      .returning();

    const matchDays = getMatchDays(
      tournamentId,
      insertedTournamentWeeks,
      data.selectedCalendarWeeks,
    );

    await tx.delete(matchday).where(eq(matchday.tournamentId, tournamentId));
    await tx.insert(matchday).values(matchDays);
  });

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

function getMatchDays(
  tournamentId: number,
  insertedTournamentWeeks: (typeof tournamentWeek.$inferSelect)[],
  selectedCalendarWeeks: z.infer<
    typeof createTournamentFormSchema
  >["selectedCalendarWeeks"],
) {
  return insertedTournamentWeeks.flatMap((week, index) => {
    const tuesday = getBerlinDateTime()
      .set({
        weekNumber: week.weekNumber,
        weekday: 2,
      })
      .toJSDate();
    const thursday = getBerlinDateTime()
      .set({
        weekNumber: week.weekNumber,
        weekday: 4,
      })
      .toJSDate();
    const friday = getBerlinDateTime()
      .set({
        weekNumber: week.weekNumber,
        weekday: 5,
      })
      .toJSDate();

    const matchDays: (typeof matchday.$inferInsert)[] = [];
    if (!isHoliday(tuesday)) {
      matchDays.push({
        tournamentId,
        tournamentWeekId: week.id,
        dayOfWeek: "tuesday",
        date: getBerlinDateTime()
          .set({
            weekNumber: week.weekNumber,
            weekday: 2,
          })
          .toJSDate(),
        refereeNeeded: selectedCalendarWeeks[index].tuesday.refereeNeeded,
      });
    }
    if (!isHoliday(thursday)) {
      matchDays.push({
        tournamentId,
        tournamentWeekId: week.id,
        dayOfWeek: "thursday",
        date: getBerlinDateTime()
          .set({
            weekNumber: week.weekNumber,
            weekday: 4,
          })
          .toJSDate(),
        refereeNeeded: selectedCalendarWeeks[index].thursday.refereeNeeded,
      });
    }
    if (!isHoliday(friday)) {
      matchDays.push({
        tournamentId,
        tournamentWeekId: week.id,
        dayOfWeek: "friday",
        date: getBerlinDateTime()
          .set({
            weekNumber: week.weekNumber,
            weekday: 5,
          })
          .toJSDate(),
        refereeNeeded: selectedCalendarWeeks[index].friday.refereeNeeded,
      });
    }
    return matchDays;
  });
}
