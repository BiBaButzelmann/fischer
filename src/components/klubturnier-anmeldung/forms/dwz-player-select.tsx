"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { searchDsbPlayers } from "@/actions/participant";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DsbPlayerCandidate } from "@/lib/dsb/types";

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  firstName: string;
  lastName: string;
  vkz?: string | null;
  disabled?: boolean;
  autoApply?: boolean;
  onSelect: (candidate: DsbPlayerCandidate) => void;
};

export function DwzPlayerSelect({
  firstName,
  lastName,
  vkz,
  disabled,
  autoApply,
  onSelect,
}: Props) {
  const [query, setQuery] = useState(`${firstName} ${lastName}`.trim());
  const [candidates, setCandidates] = useState<DsbPlayerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [needsManualChoice, setNeedsManualChoice] = useState(false);
  const hasAutoApplied = useRef(false);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const shouldAutoApply = Boolean(autoApply) && !hasAutoApplied.current;
    if (!isFocused && !shouldAutoApply) {
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
    searchDsbPlayers(searchFirstName, searchLastName, vkz)
      .then((results) => {
        if (!active) {
          return;
        }
        setCandidates(results);
        if (shouldAutoApply) {
          if (results.length === 1) {
            hasAutoApplied.current = true;
            onSelect(results[0]);
          } else {
            setNeedsManualChoice(results.length > 1);
          }
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
  }, [debouncedQuery, isFocused, autoApply, vkz, onSelect]);

  const keepInputFocusedOnSelect = (event: MouseEvent) =>
    event.preventDefault();

  const handleSelect = (candidate: DsbPlayerCandidate) => {
    hasAutoApplied.current = true;
    setNeedsManualChoice(false);
    onSelect(candidate);
  };

  return (
    <Command shouldFilter={false} className="rounded-md border">
      <CommandInput
        placeholder="Vor- und Nachname eingeben…"
        value={query}
        onValueChange={setQuery}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {needsManualChoice && !isLoading ? (
        <p className="border-b px-3 py-2 text-xs text-muted-foreground">
          Mehrere Einträge zu diesem Namen – bitte den passenden auswählen.
        </p>
      ) : null}
      {isFocused || needsManualChoice ? (
        <CommandList onMouseDown={keepInputFocusedOnSelect}>
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
      ) : null}
    </Command>
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
