"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlayerPairing {
  id: string;
  white: string;
  black: string;
}

interface PlayerGroups {
  [key: string]: PlayerPairing[];
}

interface PlayerSelectorProps {
  playerGroups: PlayerGroups;
  selectedGroup: string;
  selectedPairing: PlayerPairing | null;
  onGroupChange: (group: string) => void;
  onPairingChange: (pairing: PlayerPairing) => void;
}

export function PlayerSelector({
  playerGroups,
  selectedGroup,
  selectedPairing,
  onGroupChange,
  onPairingChange,
}: PlayerSelectorProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">Player Group</label>
        <Select value={selectedGroup} onValueChange={onGroupChange}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {Object.keys(playerGroups).map((group) => (
              <SelectItem
                key={group}
                value={group}
                className="text-white hover:bg-gray-600 focus:bg-gray-600"
              >
                Group {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGroup && (
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">
            Player Pairing
          </label>
          <Select
            value={selectedPairing?.id || ""}
            onValueChange={(value) => {
              const pairing = playerGroups[selectedGroup].find(
                (p) => p.id === value,
              );
              if (pairing) onPairingChange(pairing);
            }}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select a pairing" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {playerGroups[selectedGroup].map((pairing) => (
                <SelectItem
                  key={pairing.id}
                  value={pairing.id}
                  className="text-white hover:bg-gray-600 focus:bg-gray-600"
                >
                  {pairing.white} vs {pairing.black}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
