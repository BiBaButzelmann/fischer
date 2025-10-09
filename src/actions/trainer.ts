"use server";

import { db } from "@/db/client";
import invariant from "tiny-invariant";
import { trainer } from "@/db/schema/trainer";
import { authWithRedirect } from "@/auth/utils";
import { getTournamentById } from "@/db/repositories/tournament";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { action } from "@/lib/actions";

export const createTrainer = action(
  async (tournamentId: number, profileId: number) => {
    const session = await authWithRedirect();
    invariant(
      session.user.role === "admin",
      "Nur Admins können Trainer zuweisen",
    );

    const tournament = await getTournamentById(tournamentId);
    invariant(
      tournament != null,
      "Tournament not found",
    );

    await db
      .insert(trainer)
      .values({
        profileId,
        tournamentId: tournament.id,
      })
      .onConflictDoUpdate({
        target: [trainer.tournamentId, trainer.profileId],
        set: {
          profileId,
          tournamentId: tournament.id,
        },
      });
    revalidatePath("/admin/nutzerverwaltung");
  },
);

export const deleteTrainer = action(
  async (tournamentId: number, trainerId: number) => {
    const session = await authWithRedirect();
    invariant(
      session.user.role === "admin",
      "Nur Admins können Trainer entfernen",
    );

    const tournament = await getTournamentById(tournamentId);
    invariant(tournament != null, "Tournament not found");

    await db
      .delete(trainer)
      .where(
        and(
          eq(trainer.id, trainerId),
          eq(trainer.tournamentId, tournament.id),
        ),
      );
    revalidatePath("/admin/nutzerverwaltung");
  },
);