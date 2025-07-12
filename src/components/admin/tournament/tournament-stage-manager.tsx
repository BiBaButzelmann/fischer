"use client";

import { Button } from "@/components/ui/button";
import { Tournament, TournamentStage } from "@/db/types/tournament";
import { updateTournamentStage } from "@/actions/tournament";
import { useTransition } from "react";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TournamentStageManagerProps {
  tournament: Tournament;
}

const stages: { key: TournamentStage; label: string; description: string }[] = [
  {
    key: "registration",
    label: "Anmeldung",
    description: "Teilnehmer können sich anmelden",
  },
  {
    key: "running",
    label: "Laufend",
    description: "Turnier ist aktiv",
  },
  {
    key: "done",
    label: "Abgeschlossen",
    description: "Turnier ist beendet",
  },
];

export function TournamentStageManager({
  tournament,
}: TournamentStageManagerProps) {
  const [isPending, startTransition] = useTransition();

  const currentStageIndex = stages.findIndex(
    (stage) => stage.key === tournament.stage,
  );
  const nextStage = stages[currentStageIndex + 1];

  const handleStageChange = (stage: TournamentStage) => {
    startTransition(async () => {
      await updateTournamentStage(tournament.id, stage);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aktuelle Turnierphase: {stages[currentStageIndex].label}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Verwalte hier den Fortschritt des Turniers durch die verschiedenen
          Phasen.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {stages.map((stage, index) => {
          const isActive = stage.key === tournament.stage;
          const isCompleted = index < currentStageIndex;
          const isNext = stage.key === nextStage?.key;

          return (
            <div key={stage.key} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all",
                  isActive &&
                    "bg-blue-500 border-blue-500 text-white shadow-sm",
                  isCompleted && "bg-green-500 border-green-500 text-white",
                  isNext &&
                    "border-orange-500 bg-orange-100 text-orange-700 shadow-md ring-2 ring-orange-200",
                  !isActive &&
                    !isCompleted &&
                    !isNext &&
                    "border-gray-300 bg-gray-50 text-gray-400",
                )}
              >
                {isCompleted ? <CheckIcon className="w-4 h-4" /> : index + 1}
              </div>
              <div className="ml-2 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-blue-600",
                    isCompleted && "text-green-600",
                    isNext && "text-orange-700 font-semibold",
                    !isActive && !isCompleted && !isNext && "text-gray-400",
                  )}
                >
                  {stage.label}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    isActive && "text-blue-500",
                    isCompleted && "text-green-500",
                    isNext && "text-orange-600 font-medium",
                    !isActive && !isCompleted && !isNext && "text-gray-400",
                  )}
                >
                  {stage.description}
                </p>
              </div>
              {index < stages.length - 1 && (
                <ChevronRightIcon className="w-4 h-4 mx-4 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>

      {nextStage && (
        <div className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
          <div>
            <p className="font-semibold text-orange-800">
              🎯 Nächste empfohlene Phase: {nextStage.label}
            </p>
            <p className="text-sm text-orange-600">{nextStage.description}</p>
          </div>
          <Button
            onClick={() => handleStageChange(nextStage.key)}
            disabled={isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm"
          >
            {isPending
              ? "Wird geändert..."
              : `Zu "${nextStage.label}" wechseln`}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Oder direkt zu einer Phase wechseln:
        </p>
        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <Button
              key={stage.key}
              onClick={() => handleStageChange(stage.key)}
              disabled={isPending || stage.key === tournament.stage}
              variant={stage.key === tournament.stage ? "default" : "outline"}
              size="sm"
            >
              {stage.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
