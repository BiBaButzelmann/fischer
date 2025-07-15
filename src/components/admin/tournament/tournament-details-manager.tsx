"use client";

import { useState } from "react";
import EditTournamentDetails from "./edit-tournament-details";
import CreateTournament from "./create-tournament";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Profile } from "@/db/types/profile";
import { Tournament } from "@/db/types/tournament";
import { TournamentWeek } from "@/db/types/tournamentWeek";

type Props = {
  adminProfiles: Profile[];
  tournament?: Tournament;
  tournamentWeeks: TournamentWeek[];
};

export default function TournamentDetailsManager({
  adminProfiles,
  tournament,
  tournamentWeeks,
}: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (showCreateForm) {
    return (
      <CreateTournament
        profiles={adminProfiles}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {tournament ? "Turnier bearbeiten" : "Kein Turnier gefunden"}
        </h3>
        <Button
          onClick={() => setShowCreateForm(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neues Turnier erstellen
        </Button>
      </div>

      {tournament ? (
        <EditTournamentDetails
          profiles={adminProfiles}
          tournament={tournament}
          tournamentWeeks={tournamentWeeks}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            Kein Turnier gefunden. Erstelle ein neues Turnier, um zu beginnen.
          </p>
        </div>
      )}
    </div>
  );
}
