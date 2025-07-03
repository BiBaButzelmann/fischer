import { auth } from "@/auth/utils";
import { getProfileByUserId } from "@/db/repositories/profile";
import { getLatestTournament } from "@/db/repositories/tournament";
import React from "react";

async function home() {
  const [session, tournament] = await Promise.all([
    auth(),
    getLatestTournament(),
  ]);

  const formattedStartDate = tournament?.startDate.toLocaleDateString("de-DE");
  const formattedEndDate = tournament?.endDate?.toLocaleDateString("de-DE");

  return (
    <div className="space-y-8">
      <section className="bg-card border rounded-lg p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Hallo, {getProfileName(session?.user.id)}!
        </h1>

        {tournament?.stage === "registration" ? (
          <>
            <p className="mt-2 text-lg text-muted-foreground">
              Vielen Dank für deine Anmeldung! Das Turnier beginnt am{" "}
              <span className="font-semibold text-foreground">
                {formattedStartDate}
              </span>
              .
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wir freuen uns auf spannende Partien und wünschen dir viel Erfolg!
            </p>
          </>
        ) : tournament?.stage === "running" ? (
          <>
            <p className="mt-2 text-lg text-muted-foreground">
              Das Turnier läuft derzeit! Viel Erfolg bei deinen Spielen.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enddatum:{" "}
              <span className="font-semibold text-foreground">
                {formattedEndDate}
              </span>
              .
            </p>
          </>
        ) : tournament?.stage === "done" ? (
          <>
            <p className="mt-2 text-lg text-muted-foreground">
              Das letzte Turnier ist abgeschlossen.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wir danken dir für deine Teilnahme und freuen uns auf das nächste
              Mal!
            </p>
          </>
        ) : (
          <p className="mt-2 text-lg text-muted-foreground">
            Aktuell ist kein Turnier verfügbar.
          </p>
        )}
      </section>
    </div>
  );
}

async function getProfileName(userId: string | undefined) {
  if (!userId) {
    return "Gast";
  }
  const profile = await getProfileByUserId(userId);
  return profile ? profile.firstName : "Gast";
}

export default home;
