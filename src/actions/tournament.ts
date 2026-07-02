"use server";

import { db } from "@/db/client";
import { tournament } from "@/db/schema/tournament";
import { revalidatePath } from "next/cache";
import { tournamentWeek } from "@/db/schema/tournamentWeek";
import { z } from "zod";
import { createTournamentFormSchema } from "@/schema/tournament";
import { authWithRedirect } from "@/auth/utils";
import invariant from "tiny-invariant";
import { and, eq, ne } from "drizzle-orm";
import { TournamentStage } from "@/db/types/tournament";
import { matchday } from "@/db/schema/matchday";
import { isHoliday } from "@/lib/holidays";
import { getCurrentLocalDateTime, toDateOnly } from "@/lib/date";
import {
  getActiveTournament,
  getOpenRegistrationTournament,
  getTournamentBySlug,
} from "@/db/repositories/tournament";

export async function createTournament(
  formData: z.infer<typeof createTournamentFormSchema>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = createTournamentFormSchema.parse(formData);

  const existing = await getTournamentBySlug(data.slug);
  if (existing) {
    return { error: `Der Slug "${data.slug}" ist bereits vergeben.` };
  }

  const activeTournament = await getActiveTournament();
  if (activeTournament) {
    return {
      error:
        "Es gibt noch ein nicht abgeschlossenes Turnier. Alle bestehenden Turniere müssen abgeschlossen sein, bevor du ein neues Turnier anlegst.",
    };
  }

  await db.transaction(async (tx) => {
    const newTournament: typeof tournament.$inferInsert = {
      name: data.name,
      slug: data.slug,
      allClocksDigital: true,
      club: data.clubName,
      startDate: data.startDate,
      endDate: data.endDate,
      endRegistrationDate: data.endRegistrationDate,
      groupAnnouncementOffsetDays: data.groupAnnouncementOffsetDays,
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

  revalidatePath("/", "layout");
}

export async function updateTournament(
  tournamentId: number,
  formData: z.infer<typeof createTournamentFormSchema>,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  const data = createTournamentFormSchema.parse(formData);

  const slugOwner = await db.query.tournament.findFirst({
    where: and(eq(tournament.slug, data.slug), ne(tournament.id, tournamentId)),
  });
  if (slugOwner) {
    return { error: `Der Slug "${data.slug}" ist bereits vergeben.` };
  }

  const updateData: Partial<typeof tournament.$inferInsert> = {
    name: data.name,
    slug: data.slug,
    club: data.clubName,
    startDate: data.startDate,
    endDate: data.endDate,
    endRegistrationDate: data.endRegistrationDate,
    groupAnnouncementOffsetDays: data.groupAnnouncementOffsetDays,
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

  revalidatePath("/", "layout");
}

export async function updateTournamentStage(
  tournamentId: number,
  stage: TournamentStage,
) {
  const session = await authWithRedirect();
  invariant(session?.user.role === "admin", "Unauthorized");

  if (stage === "registration") {
    const openRegistration = await getOpenRegistrationTournament();
    if (openRegistration && openRegistration.id !== tournamentId) {
      return {
        error: "Ein anderes Turnier befindet sich bereits in der Anmeldephase.",
      };
    }
  }

  await db
    .update(tournament)
    .set({ stage })
    .where(eq(tournament.id, tournamentId));

  revalidatePath("/", "layout");
}

function getMatchDays(
  tournamentId: number,
  insertedTournamentWeeks: (typeof tournamentWeek.$inferSelect)[],
  selectedCalendarWeeks: z.infer<
    typeof createTournamentFormSchema
  >["selectedCalendarWeeks"],
) {
  return insertedTournamentWeeks.flatMap((week, index) => {
    const tuesday = getCurrentLocalDateTime().set({
      weekNumber: week.weekNumber,
      weekday: 2,
    });
    const thursday = getCurrentLocalDateTime().set({
      weekNumber: week.weekNumber,
      weekday: 4,
    });
    const friday = getCurrentLocalDateTime().set({
      weekNumber: week.weekNumber,
      weekday: 5,
    });

    const matchDays: (typeof matchday.$inferInsert)[] = [];
    if (!isHoliday(tuesday.toJSDate())) {
      matchDays.push({
        tournamentId,
        tournamentWeekId: week.id,
        dayOfWeek: "tuesday",
        date: toDateOnly(tuesday),
        refereeNeeded: selectedCalendarWeeks[index].tuesday.refereeNeeded,
      });
    }
    if (!isHoliday(thursday.toJSDate())) {
      matchDays.push({
        tournamentId,
        tournamentWeekId: week.id,
        dayOfWeek: "thursday",
        date: toDateOnly(thursday),
        refereeNeeded: selectedCalendarWeeks[index].thursday.refereeNeeded,
      });
    }
    if (!isHoliday(friday.toJSDate())) {
      matchDays.push({
        tournamentId,
        tournamentWeekId: week.id,
        dayOfWeek: "friday",
        date: toDateOnly(friday),
        refereeNeeded: selectedCalendarWeeks[index].friday.refereeNeeded,
      });
    }
    return matchDays;
  });
}
