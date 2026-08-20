"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ACTIVITY_EVENT_LABELS,
  type ActivityEventType,
} from "@/lib/activity";
import { cn } from "@/lib/utils";
import { tournamentPath } from "@/lib/navigation";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";

type ProfileOption = { id: number; firstName: string; lastName: string };

type Props = {
  profiles: ProfileOption[];
  profileId?: number;
  types: ActivityEventType[];
  availableTypes: ActivityEventType[];
  defaultTypes: ActivityEventType[];
  from?: string;
  fromIsDefault: boolean;
  to?: string;
};

export function ActivityFilters({
  profiles,
  profileId,
  types,
  availableTypes,
  defaultTypes,
  from,
  fromIsDefault,
  to,
}: Props) {
  const router = useRouter();
  const slug = useTournamentSlug();
  const [profilePickerOpen, setProfilePickerOpen] = useState(false);

  const selectedProfile = profiles.find((p) => p.id === profileId);

  const buildUrl = (overrides: {
    profileId?: number | null;
    types?: ActivityEventType[];
    from?: string | null;
    to?: string | null;
  }) => {
    const params = new URLSearchParams();

    const nextProfileId =
      overrides.profileId !== undefined ? overrides.profileId : profileId;
    const nextTypes = overrides.types ?? types;
    const nextFrom =
      overrides.from !== undefined ? overrides.from : fromIsDefault ? null : from;
    const nextTo = overrides.to !== undefined ? overrides.to : to;

    if (nextProfileId) {
      params.set("profileId", String(nextProfileId));
    }
    if (nextTypes.length > 0 && !sameSet(nextTypes, defaultTypes)) {
      params.set("types", nextTypes.join(","));
    }
    if (nextFrom) {
      params.set("from", nextFrom);
    }
    if (nextTo) {
      params.set("to", nextTo);
    }

    const query = params.toString();
    return tournamentPath(slug, `/admin/logging${query ? `?${query}` : ""}`);
  };

  const handleDateBlur = (field: "from" | "to", value: string) => {
    const current = field === "from" ? from : to;
    const next = value || null;
    if ((next ?? "") !== (current ?? "")) {
      router.push(buildUrl({ [field]: next }));
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-profile">Nutzer</Label>
        <Popover open={profilePickerOpen} onOpenChange={setProfilePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              id="activity-profile"
              variant="outline"
              role="combobox"
              className="w-64 justify-between"
            >
              {selectedProfile
                ? `${selectedProfile.lastName}, ${selectedProfile.firstName}`
                : "Alle Nutzer"}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Nutzer suchen…" />
              <CommandList>
                <CommandEmpty>Keine Treffer</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__all__"
                    onSelect={() => {
                      setProfilePickerOpen(false);
                      router.push(buildUrl({ profileId: null }));
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        profileId == null ? "opacity-100" : "opacity-0",
                      )}
                    />
                    Alle Nutzer
                  </CommandItem>
                  {profiles.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`${p.lastName} ${p.firstName}`}
                      onSelect={() => {
                        setProfilePickerOpen(false);
                        router.push(buildUrl({ profileId: p.id }));
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          profileId === p.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {p.lastName}, {p.firstName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <Label id="activity-types-label">Aktionstyp</Label>
        <ToggleGroup
          type="multiple"
          variant="outline"
          aria-labelledby="activity-types-label"
          value={types}
          onValueChange={(value) =>
            router.push(buildUrl({ types: value as ActivityEventType[] }))
          }
        >
          {availableTypes.map((type) => (
            <ToggleGroupItem key={type} value={type} className="px-3 text-xs">
              {ACTIVITY_EVENT_LABELS[type]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="activity-from">Von</Label>
          <Input
            id="activity-from"
            type="date"
            className="w-40"
            key={`from-${from ?? ""}`}
            defaultValue={from ?? ""}
            onBlur={(e) => handleDateBlur("from", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="activity-to">Bis</Label>
          <Input
            id="activity-to"
            type="date"
            className="w-40"
            key={`to-${to ?? ""}`}
            defaultValue={to ?? ""}
            onBlur={(e) => handleDateBlur("to", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function sameSet(a: ActivityEventType[], b: ActivityEventType[]) {
  return a.length === b.length && a.every((item) => b.includes(item));
}
