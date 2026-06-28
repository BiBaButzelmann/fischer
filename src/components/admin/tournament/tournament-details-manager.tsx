"use client";

import { useState } from "react";
import EditTournamentDetails from "./edit-tournament-details";
import CreateTournament from "./create-tournament";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon, Plus } from "lucide-react";
import { Profile } from "@/db/types/profile";
import { Tournament } from "@/db/types/tournament";
import { TournamentWeekWithMatchdays } from "@/db/types/tournamentWeek";
import { toast } from "sonner";

type Props = {
  adminProfiles: Profile[];
  tournament?: Tournament;
  tournamentWeeks: TournamentWeekWithMatchdays[];
  activeTournamentName?: string;
  defaultOpen: boolean;
};

export default function TournamentDetailsManager({
  adminProfiles,
  tournament,
  tournamentWeeks,
  activeTournamentName,
  defaultOpen,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateClick = () => {
    if (activeTournamentName) {
      toast.error(`${activeTournamentName} ist noch nicht abgeschlossen.`);
      return;
    }
    setOpen(true);
    setShowCreateForm(true);
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border border-primary rounded-md p-4"
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger className="flex-grow text-left font-medium">
          Turnierdetails bearbeiten
        </CollapsibleTrigger>
        <Button
          onClick={handleCreateClick}
          size="sm"
          className="flex shrink-0 items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neues Turnier erstellen
        </Button>
        <CollapsibleTrigger className="shrink-0">
          <ChevronDownIcon className="h-5 w-5" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4">
        {showCreateForm ? (
          <CreateTournament
            profiles={adminProfiles}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : tournament ? (
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
      </CollapsibleContent>
    </Collapsible>
  );
}
