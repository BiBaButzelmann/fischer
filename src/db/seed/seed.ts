import { drizzle } from "drizzle-orm/neon-http";
import { profile } from "../schema/profile";
import { participant } from "../schema/participant";
import { seed } from "drizzle-seed";
import { fideIds } from "./data/fideIds";
import { fideRatings } from "./data/fideRatings";
import { profileIds } from "./data/profileIds";
import { gte } from "drizzle-orm";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { profile }).refine((f) => ({
    profile: {
      columns: {
        id: f.valuesFromArray({
          values: profileIds,
          isUnique: true,
        }),
        name: f.fullName(),

        coLine: f.default({ defaultValue: null }),
        city: f.city(),
        street: f.streetAddress(),
        postalCode: f.postcode(),
      },
      count: 100,
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
        fideRating: f.valuesFromArray({
          values: fideRatings,
          isUnique: true,
        }),
        dwzRating: f.valuesFromArray({
          values: fideRatings,
          isUnique: true,
        }),
      },
      count: 100,
    },
  }));
}

main();
