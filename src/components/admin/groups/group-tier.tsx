"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GridGroup } from "./types";
import { tierLetter } from "@/lib/groups";

const TIER_OPTIONS = [0, 1, 2, 3, 4];

type Props = {
  group: GridGroup;
  onChangeGroupTier: (groupId: number, tier: number) => void;
};

export function GroupTier({ group, onChangeGroupTier }: Props) {
  const handleTierChange = (value: string) => {
    onChangeGroupTier(group.id, Number(value));
  };

  return (
    <Select
      value={group.tier != null ? group.tier.toString() : undefined}
      onValueChange={handleTierChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Stufe" />
      </SelectTrigger>
      <SelectContent>
        {TIER_OPTIONS.map((tier) => (
          <SelectItem key={tier} value={tier.toString()}>
            Stufe {tierLetter(tier)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
