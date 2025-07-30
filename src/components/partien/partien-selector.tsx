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
import type { TournamentNames } from "@/db/types/tournament";
import type { GroupSummary } from "@/db/types/group";
import type { ParticipantWithName } from "@/db/types/participant";
import { buildGameViewUrl } from "@/lib/navigation";

export type Props = {
  selectedTournamentId: string;
  tournamentNames: TournamentNames[];
  selectedGroupId: string;
  groups: GroupSummary[];
  selectedRound?: string;
  rounds: number[];
  selectedParticipantId?: string;
  participants: ParticipantWithName[];
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
}: Props) {
  const router = useRouter();

  const handleTournamentChange = (tournamentId: string) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(tournamentId),
        groupId: parseInt(selectedGroupId),
        round: selectedRound ? parseInt(selectedRound) : undefined,
        participantId: selectedParticipantId
          ? parseInt(selectedParticipantId)
          : undefined,
      }),
    );
  };

  const handleGroupChange = (group: string) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(selectedTournamentId),
        groupId: parseInt(group),
        round: selectedRound ? parseInt(selectedRound) : undefined,
        participantId: selectedParticipantId
          ? parseInt(selectedParticipantId)
          : undefined,
      }),
    );
  };

  const handleRoundChange = (round: string | undefined) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(selectedTournamentId),
        groupId: parseInt(selectedGroupId),
        round: round ? parseInt(round) : undefined,
        participantId: selectedParticipantId
          ? parseInt(selectedParticipantId)
          : undefined,
      }),
    );
  };

  const handleParticipantChange = (participantId: string | undefined) => {
    router.push(
      buildGameViewUrl({
        tournamentId: parseInt(selectedTournamentId),
        groupId: parseInt(selectedGroupId),
        round: selectedRound ? parseInt(selectedRound) : undefined,
        participantId: participantId ? parseInt(participantId) : undefined,
      }),
    );
  };

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
        <Label htmlFor="group-select" className="text-sm font-medium">
          Gruppe
        </Label>
        <Select value={selectedGroupId} onValueChange={handleGroupChange}>
          <SelectTrigger id="group-select" className="w-48">
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
