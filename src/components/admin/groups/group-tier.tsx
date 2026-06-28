"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GridGroup } from "./types";
import { tierLetter } from "@/lib/groups";

const TIER_OPTIONS = Array.from({ length: 26 }, (_, i) => i);

type Props = {
  group: GridGroup;
  onChangeGroupTier: (groupId: number, tier: number) => void;
};

export function GroupTier({ group, onChangeGroupTier }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="font-semibold"
          aria-label="Spielstärke auswählen"
        >
          {group.tier != null ? tierLetter(group.tier) : "?"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
        {TIER_OPTIONS.map((tier) => (
          <DropdownMenuItem
            key={tier}
            onClick={() => onChangeGroupTier(group.id, tier)}
          >
            Stufe {tierLetter(tier)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
