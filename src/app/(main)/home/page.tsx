import { db } from "@/db/client";
import { session } from "@/db/schema/auth";
import React from "react";

async function home() {
  const profileRow = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, session.userId),
  });

  return (
    <div className="space-y-8">
      <section className="bg-card border rounded-lg p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Hallo, {profileRow?.firstName}!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Vielen Dank für deine Anmeldung! Das Turnier beginnt am{" "}
          <span className="font-semibold text-foreground">16.09.2025</span>.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Wir freuen uns auf spannende Partien und wünschen dir viel Erfolg!
        </p>
      </section>
    </div>
  );
}

export default home;
