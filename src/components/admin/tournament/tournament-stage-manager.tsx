"use client";

import { Button } from "@/components/ui/button";
import { Tournament, TournamentStage } from "@/db/types/tournament";
import { updateTournamentStage } from "@/actions/tournament";
import { useTransition, useState } from "react";

type Props = {
  tournament: Tournament;
};

const stages: { key: TournamentStage; label: string }[] = [
  {
    key: "registration",
    label: "Anmeldung",
  },
  {
    key: "running",
    label: "Laufend",
  },
  {
    key: "done",
    label: "Abgeschlossen",
  },
];

export function TournamentStageManager({ tournament }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedStage, setSelectedStage] = useState<TournamentStage | null>(
    null,
  );

  const handleStageSelect = (stage: TournamentStage) => {
    setSelectedStage(stage);
  };

  const handleSaveStageChange = () => {
    if (selectedStage) {
      startTransition(async () => {
        await updateTournamentStage(tournament.id, selectedStage);
        setSelectedStage(null);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <Button
              key={stage.key}
              onClick={() => handleStageSelect(stage.key)}
              disabled={isPending || stage.key === tournament.stage}
              variant={
                selectedStage === stage.key
                  ? "default"
                  : stage.key === tournament.stage
                    ? "secondary"
                    : "outline"
              }
              size="sm"
            >
              {stage.label}
            </Button>
          ))}
        </div>
      </div>

      {selectedStage && selectedStage !== tournament.stage && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex-1">
            Phase zu &ldquo;{stages.find((s) => s.key === selectedStage)?.label}
            &rdquo; ändern?
          </p>
          <Button
            onClick={handleSaveStageChange}
            disabled={isPending}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isPending ? "Speichert..." : "Speichern"}
          </Button>
          <Button
            onClick={() => setSelectedStage(null)}
            disabled={isPending}
            variant="outline"
            size="sm"
          >
            Abbrechen
          </Button>
        </div>
      )}
    </div>
  );
}
