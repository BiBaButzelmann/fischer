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

export function PartienSelector({
  selectedTournamentId,
  tournamentNames,
  selectedGroupId,
  groups,
  selectedRound,
  rounds,
  selectedParticipantId,
  participants,
}: {
  selectedTournamentId: string;
  tournamentNames: {
    id: number;
    name: string;
    numberOfRounds: number;
  }[];
  selectedGroupId: string;
  groups: {
    id: number;
    groupName: string;
  }[];
  selectedRound?: string;
  rounds: number[];
  selectedParticipantId?: string;
  participants: {
    title: string | null;
    id: number;
    profile: {
      firstName: string;
      lastName: string;
    };
  }[];
}) {
  const router = useRouter();

  const buildUrl = (params: {
    tournamentId: string;
    groupId: string;
    round?: string;
    participantId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.set("tournamentId", params.tournamentId);
    searchParams.set("groupId", params.groupId);

    if (params.round != null && params.round !== "") {
      searchParams.set("round", params.round);
    }

    if (params.participantId != null && params.participantId !== "") {
      searchParams.set("participantId", params.participantId);
    }

    return `?${searchParams.toString()}`;
  };

  const handleTournamentChange = (tournamentId: string) => {
    router.push(
      buildUrl({
        tournamentId,
        groupId: selectedGroupId,
        round: selectedRound,
        participantId: selectedParticipantId,
      }),
    );
  };

  const handleGroupChange = (group: string) => {
    router.push(
      buildUrl({
        tournamentId: selectedTournamentId,
        groupId: group,
        round: selectedRound,
        participantId: selectedParticipantId,
      }),
    );
  };

  const handleRoundChange = (round: string | undefined) => {
    router.push(
      buildUrl({
        tournamentId: selectedTournamentId,
        groupId: selectedGroupId,
        round,
        participantId: selectedParticipantId,
      }),
    );
  };

  const handleParticipantChange = (participantId: string | undefined) => {
    router.push(
      buildUrl({
        tournamentId: selectedTournamentId,
        groupId: selectedGroupId,
        round: selectedRound,
        participantId,
      }),
    );
  };

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="tournament-select" className="text-sm font-medium">
          Ausgabe
        </Label>
        <Select
          value={selectedTournamentId}
          onValueChange={handleTournamentChange}
        >
          <SelectTrigger id="tournament-select" className="w-32">
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
