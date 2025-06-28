import { db } from "@/db/client";
import { session } from "@/db/schema/auth";
import React from "react";

async function home() {
  const profileRow = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, session.userId),
  });

  const tournament = await db.query.tournament.findFirst({
    orderBy: (tournament, { desc }) => [desc(tournament.createdAt)],
  });

  // Fallback, falls kein Turnier existiert
  if (!tournament) {
    return (
      <div className="space-y-8">
        <section className="bg-card border rounded-lg p-6 md:p-8 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
            Hallo, {profileRow?.firstName}!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Aktuell ist kein Turnier verfügbar.
          </p>
        </section>
      </div>
    );
  }

  // Datum formatieren: TT.MM.JJJJ
  const formattedStartDate = tournament.startDate.toLocaleDateString("de-DE");
  const formattedEndDate = tournament.endDate?.toLocaleDateString("de-DE");

  const { stage } = tournament;

  return (
    <div className="space-y-8">
      <section className="bg-card border rounded-lg p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Hallo, {profileRow?.firstName}!
        </h1>

        {stage === "registration" && (
          <>
            <p className="mt-2 text-lg text-muted-foreground">
              Vielen Dank für deine Anmeldung! Das Turnier beginnt am{" "}
              <span className="font-semibold text-foreground">{formattedStartDate}</span>.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wir freuen uns auf spannende Partien und wünschen dir viel Erfolg!
            </p>
          </>
        )}

        {stage === "running" && (
          <>
            <p className="mt-2 text-lg text-muted-foreground">
              Das Turnier läuft derzeit! Viel Erfolg bei deinen Spielen.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enddatum:{" "}
              <span className="font-semibold text-foreground">{formattedEndDate}</span>.
            </p>
          </>
        )}

        {stage === "done" && (
          <>
            <p className="mt-2 text-lg text-muted-foreground">
              Das letzte Turnier ist abgeschlossen.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wir danken dir für deine Teilnahme und freuen uns auf das nächste Mal!
            </p>
          </>
        )}
      </section>
    </div>
  );
}

export default home;
