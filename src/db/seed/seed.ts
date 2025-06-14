import { drizzle } from "drizzle-orm/neon-http";
import { profile } from "../schema/profile";
import { participant } from "../schema/participant";
import { seed } from "drizzle-seed";
import { fideIds } from "./data/fideIds";
import { gte, isNull } from "drizzle-orm";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { profile }).refine((f) => ({
    profile: {
      columns: {
        id: f.int({
          minValue: 100,
          isUnique: true,
        }),
        firstName: f.firstName(),
        lastName: f.lastName(),
        email: f.email(),
      },
      count: 105,
    },
  }));

  const profileDbs = await db
    .select({ id: profile.id })
    .from(profile)
    .where(gte(profile.id, 100));

  await seed(db, { participant }).refine((f) => ({
    participant: {
      columns: {
        id: f.int({
          minValue: 100,
          isUnique: true,
        }),
        profileId: f.valuesFromArray({
          values: profileDbs.map((p) => p.id),
          isUnique: true,
        }),
        tournamentId: f.default({ defaultValue: 1 }),
        fideId: f.valuesFromArray({
          values: fideIds,
          isUnique: true,
        }),
        fideRating: f.weightedRandom([
          { weight: 0.7, value: f.int({ minValue: 1000, maxValue: 2500 }) },
          { weight: 0.3, value: f.default({ defaultValue: null }) },
        ]),
        dwzRating: f.int({
          minValue: 1000,
          maxValue: 2500,
        }),
        groupId: f.default({ defaultValue: null }),
        groupPosition: f.default({ defaultValue: null }),
      },
      count: 105,
    },
  }));

  await db
    .update(participant)
    .set({
      fideId: null,
    })
    .where(isNull(participant.fideRating));
}

main();
