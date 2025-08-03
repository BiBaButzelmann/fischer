"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { TournamentNames } from "@/db/types/tournament";
import type { GroupSummary } from "@/db/types/group";
import type { ParticipantWithName } from "@/db/types/participant";
import type { MatchDay } from "@/db/types/match-day";
import { buildGameViewUrl } from "@/lib/navigation";

export type Props = {
  selectedTournamentId: string;
  tournamentNames: TournamentNames[];
  selectedGroupId?: string;
  groups: GroupSummary[];
  selectedRound?: string;
  rounds: number[];
  selectedParticipantId?: string;
  participants: ParticipantWithName[];
  selectedMatchdayId?: string;
  matchdays: MatchDay[];
};

export function PartienSelector({
  selectedTournamentId,
  tournamentNames,
  selectedGroupId,
  groups,
  selectedRound,
  rounds,
  selectedParticipantId,
  participants,
  selectedMatchdayId,
  matchdays,
}: Props) {
  const router = useRouter();

  const handleTournamentChange = (tournamentId: string) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(tournamentId),
        groupId: selectedGroupId ? parseInt(selectedGroupId) : undefined,
        round: selectedRound ? parseInt(selectedRound) : undefined,
        participantId: selectedParticipantId
          ? parseInt(selectedParticipantId)
          : undefined,
        matchdayId: selectedMatchdayId
          ? parseInt(selectedMatchdayId)
          : undefined,
      }),
    );
  };

  const handleGroupChange = (group: string | undefined) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(selectedTournamentId),
        groupId: group ? parseInt(group) : undefined,
        round: selectedRound ? parseInt(selectedRound) : undefined,
        participantId: selectedParticipantId
          ? parseInt(selectedParticipantId)
          : undefined,
        matchdayId: selectedMatchdayId
          ? parseInt(selectedMatchdayId)
          : undefined,
      }),
    );
  };

  const handleRoundChange = (round: string | undefined) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(selectedTournamentId),
        groupId: selectedGroupId ? parseInt(selectedGroupId) : undefined,
        round: round ? parseInt(round) : undefined,
        participantId: selectedParticipantId
          ? parseInt(selectedParticipantId)
          : undefined,
        matchdayId: selectedMatchdayId
          ? parseInt(selectedMatchdayId)
          : undefined,
      }),
    );
  };

  const handleParticipantChange = (participantId: string | undefined) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(selectedTournamentId),
        groupId: selectedGroupId ? parseInt(selectedGroupId) : undefined,
        round: selectedRound ? parseInt(selectedRound) : undefined,
        participantId: participantId ? parseInt(participantId) : undefined,
        matchdayId: selectedMatchdayId
          ? parseInt(selectedMatchdayId)
          : undefined,
      }),
    );
  };

  const handleMatchdayChange = (matchdayId: string | undefined) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(selectedTournamentId),
        groupId: selectedGroupId ? parseInt(selectedGroupId) : undefined,
        round: selectedRound ? parseInt(selectedRound) : undefined,
        participantId: selectedParticipantId
          ? parseInt(selectedParticipantId)
          : undefined,
        matchdayId: matchdayId ? parseInt(matchdayId) : undefined,
      }),
    );
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      handleMatchdayChange(undefined);
      return;
    }

    const matchday = matchdays.find((md) => {
      const mdDate = new Date(md.date);
      return mdDate.toDateString() === date.toDateString();
    });

    if (matchday) {
      handleMatchdayChange(matchday.id.toString());
    }
  };

  const selectedMatchday = selectedMatchdayId
    ? matchdays.find((md) => md.id === Number(selectedMatchdayId))
    : undefined;

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="tournament-select" className="text-sm font-medium">
          Ausgabe
        </Label>
        <Select
          value={selectedTournamentId}
          onValueChange={handleTournamentChange}
        >
          <SelectTrigger id="tournament-select" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tournamentNames.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Spieltag</Label>
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-48 justify-start text-left font-normal",
                  !selectedMatchday && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedMatchday ? (
                  format(new Date(selectedMatchday.date), "dd.MM.yyyy", {
                    locale: de,
                  })
                ) : (
                  <span>Datum wählen</span>
                )}
                {selectedMatchday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMatchdayChange(undefined);
                    }}
                    className="absolute right-1 h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    ✕
                  </Button>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  selectedMatchday ? new Date(selectedMatchday.date) : undefined
                }
                onSelect={handleDateChange}
                disabled={(date) => {
                  return !matchdays.some((md) => {
                    const mdDate = new Date(md.date);
                    return mdDate.toDateString() === date.toDateString();
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="group-select" className="text-sm font-medium">
          Gruppe
        </Label>
        <Select
          key={selectedGroupId}
          value={selectedGroupId}
          onValueChange={handleGroupChange}
        >
          <SelectTrigger
            id="group-select"
            className="w-48"
            clearable={selectedGroupId != null}
            onClear={() => handleGroupChange(undefined)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.groupName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="round-select" className="text-sm font-medium">
          Runde
        </Label>
        <Select
          key={selectedRound}
          value={selectedRound}
          onValueChange={handleRoundChange}
        >
          <SelectTrigger
            id="round-select"
            className="w-48"
            clearable={selectedRound != null}
            onClear={() => handleRoundChange(undefined)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rounds.map((r) => (
              <SelectItem key={r} value={r.toString()}>
                Runde {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="participant-select" className="text-sm font-medium">
          Spieler
        </Label>
        <Select
          key={selectedParticipantId}
          value={selectedParticipantId}
          onValueChange={handleParticipantChange}
        >
          <SelectTrigger
            id="participant-select"
            className="w-48"
            clearable={selectedParticipantId != null}
            onClear={() => handleParticipantChange(undefined)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {participants.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.title} {p.profile.firstName} {p.profile.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
