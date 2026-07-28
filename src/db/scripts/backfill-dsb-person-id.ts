// Einmaliges Backfill der participant.dsb_person_id für Bestandsdaten.
// Nutzung:
//   bun run src/db/scripts/backfill-dsb-person-id.ts           (Dry-Run, schreibt nichts)
//   bun run src/db/scripts/backfill-dsb-person-id.ts --apply   (schreibt sichere Treffer)

import { eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { participant } from "@/db/schema/participant";
import { profile } from "@/db/schema/profile";
import { transliterateGermanUmlauts } from "@/lib/dsb/candidate";
import { DSB_BASE_URL } from "@/lib/dsb/constants";

const REQUEST_TIMEOUT_MS = 8000;
const REQUEST_DELAY_MS = 150;

type DsbPerson = {
  nuLigaPersonId: string;
  firstname: string;
  lastname: string;
  birthyear: number | null;
  fideId: number | null;
};

type ParticipantRow = {
  id: number;
  firstName: string;
  lastName: string;
  birthYear: number | null;
  fideId: string | null;
};

type Match = {
  nuLigaPersonId: string;
  reason: "fideId" | "unique+birthYear";
};

async function fetchFromEndpoint(query: string): Promise<DsbPerson[]> {
  const response = await fetch(`${DSB_BASE_URL}/persons?${query}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`DSB request failed: ${response.status}`);
  }
  const body = (await response.json()) as { data?: DsbPerson[] };
  return body.data ?? [];
}

async function fetchPersonsByName(
  firstName: string,
  lastName: string,
): Promise<DsbPerson[]> {
  const params = new URLSearchParams({
    lastname: transliterateGermanUmlauts(lastName.trim()),
  });
  if (firstName.trim().length > 0) {
    params.set("firstname", transliterateGermanUmlauts(firstName.trim()));
  }
  return fetchFromEndpoint(params.toString());
}

async function fetchPersonByFideId(fideId: string): Promise<DsbPerson | null> {
  const results = await fetchFromEndpoint(
    new URLSearchParams({ fideId }).toString(),
  );
  return results[0] ?? null;
}

function pickNameMatch(results: DsbPerson[], p: ParticipantRow): Match | null {
  if (
    results.length === 1 &&
    p.birthYear != null &&
    results[0].birthyear === p.birthYear
  ) {
    return {
      nuLigaPersonId: results[0].nuLigaPersonId,
      reason: "unique+birthYear",
    };
  }
  return null;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const rows: ParticipantRow[] = await db
    .select({
      id: participant.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthYear: participant.birthYear,
      fideId: participant.fideId,
    })
    .from(participant)
    .innerJoin(profile, eq(participant.profileId, profile.id))
    .where(isNull(participant.dsbPersonId));

  console.log(
    `${apply ? "APPLY" : "DRY-RUN"} — ${rows.length} Teilnehmer ohne dsb_person_id`,
  );

  let byFide = 0;
  let byUnique = 0;
  let noResult = 0;
  let singleUnconfirmed = 0;
  let multiple = 0;
  let errors = 0;
  const skipped: string[] = [];

  for (const p of rows) {
    const label = `${p.firstName} ${p.lastName}`;
    try {
      let match: Match | null = null;

      const fideId = p.fideId?.trim();
      if (fideId) {
        const person = await fetchPersonByFideId(fideId);
        if (person) {
          match = { nuLigaPersonId: person.nuLigaPersonId, reason: "fideId" };
        }
      }

      let nameResults: DsbPerson[] = [];
      if (!match) {
        nameResults = await fetchPersonsByName(p.firstName, p.lastName);
        match = pickNameMatch(nameResults, p);
      }

      if (match) {
        if (apply) {
          await db
            .update(participant)
            .set({ dsbPersonId: match.nuLigaPersonId })
            .where(eq(participant.id, p.id));
        }
        if (match.reason === "fideId") {
          byFide++;
        } else {
          byUnique++;
        }
        console.log(`✓ ${label} → ${match.nuLigaPersonId} (${match.reason})`);
      } else if (nameResults.length === 0) {
        noResult++;
        skipped.push(`${label} — kein Treffer`);
      } else if (nameResults.length === 1) {
        singleUnconfirmed++;
        const r = nameResults[0];
        skipped.push(
          `${label} — 1 Treffer ${r.nuLigaPersonId} (Jahrgang ${r.birthyear ?? "?"} vs ${p.birthYear ?? "?"}, FIDE ${r.fideId ?? "-"} vs ${p.fideId ?? "-"})`,
        );
      } else {
        multiple++;
        skipped.push(`${label} — ${nameResults.length} Treffer, mehrdeutig`);
      }
    } catch (e) {
      errors++;
      console.log(`! ${label} — Fehler: ${(e as Error).message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }

  console.log("\n— Zusammenfassung —");
  console.log(`gesetzt per FIDE-ID:          ${byFide}`);
  console.log(`gesetzt per Name+Jahrgang:    ${byUnique}`);
  console.log(`1 Treffer, unbestätigt:       ${singleUnconfirmed}`);
  console.log(`mehrere Treffer:              ${multiple}`);
  console.log(`kein Treffer:                 ${noResult}`);
  console.log(`Fehler:                       ${errors}`);
  console.log(`→ gesamt gesetzt: ${byFide + byUnique} / ${rows.length}`);

  if (skipped.length > 0) {
    console.log("\nManuell nachpflegen:");
    for (const entry of skipped) {
      console.log(`  - ${entry}`);
    }
  }

  if (!apply) {
    console.log(
      "\nDry-Run — nichts geschrieben. Mit --apply erneut ausführen zum Übernehmen.",
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
