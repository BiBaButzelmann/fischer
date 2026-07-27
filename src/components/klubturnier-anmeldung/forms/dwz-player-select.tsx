"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { searchDsbPlayers } from "@/actions/participant";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DsbPlayerCandidate } from "@/lib/dsb/types";

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  firstName: string;
  lastName: string;
  disabled?: boolean;
  onSelect: (candidate: DsbPlayerCandidate) => void;
};

export function DwzPlayerSelect({
  firstName,
  lastName,
  disabled,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(`${firstName} ${lastName}`.trim());
  const [candidates, setCandidates] = useState<DsbPlayerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (!open) {
      return;
    }

    const { searchFirstName, searchLastName } = splitName(debouncedQuery);
    if (searchLastName.length === 0) {
      setCandidates([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    searchDsbPlayers(searchFirstName, searchLastName)
      .then((results) => {
        if (active) {
          setCandidates(results);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, debouncedQuery]);

  const handleSelect = (candidate: DsbPlayerCandidate) => {
    onSelect(candidate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          DWZ-Daten aus der DSB-Datenbank übernehmen
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Vor- und Nachname eingeben…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="space-y-1 p-1">
                <CandidateSkeleton />
                <CandidateSkeleton />
                <CandidateSkeleton />
              </div>
            ) : (
              <>
                <CommandEmpty>Keine Treffer gefunden</CommandEmpty>
                {candidates.map((candidate) => (
                  <CommandItem
                    key={candidate.nuLigaPersonId}
                    value={candidate.nuLigaPersonId}
                    onSelect={() => handleSelect(candidate)}
                    className="items-start px-3 py-2.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {candidate.birthYear != null ? (
                          <span>Jahrgang {candidate.birthYear}</span>
                        ) : null}
                        {candidate.clubName != null ? (
                          <span>{candidate.clubName}</span>
                        ) : null}
                        {candidate.dwzRating != null ? (
                          <span>DWZ {candidate.dwzRating}</span>
                        ) : null}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CandidateSkeleton() {
  return (
    <div className="space-y-2 rounded-sm px-3 py-2.5">
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  );
}

function splitName(value: string): {
  searchFirstName: string;
  searchLastName: string;
} {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { searchFirstName: "", searchLastName: "" };
  }
  if (tokens.length === 1) {
    return { searchFirstName: "", searchLastName: tokens[0] };
  }
  return {
    searchFirstName: tokens.slice(0, -1).join(" "),
    searchLastName: tokens[tokens.length - 1],
  };
}
