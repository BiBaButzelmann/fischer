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

  await db.insert(tournament).values(newTournament);

  revalidatePath("/admin/tournament");
}
