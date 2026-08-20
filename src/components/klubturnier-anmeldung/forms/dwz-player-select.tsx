"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Paperclip, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
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
  autoApply?: boolean;
  onSelect: (candidate: DsbPlayerCandidate) => void;
};

export function DwzPlayerSelect({
  firstName,
  lastName,
  vkz,
  autoApply,
  onSelect,
}: Props) {
  const [initialSearch] = useState(() => ({
    firstName,
    lastName,
    vkz,
    autoApply,
    onSelect,
  }));
  const [query, setQuery] = useState(`${firstName} ${lastName}`.trim());
  const [candidates, setCandidates] = useState<DsbPlayerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (!initialSearch.autoApply) {
      return;
    }

    const { searchFirstName, searchLastName } = splitName(
      `${initialSearch.firstName} ${initialSearch.lastName}`.trim(),
    );
    if (searchLastName.length === 0) {
      return;
    }

    let active = true;
    searchDsbPlayers(searchFirstName, searchLastName, initialSearch.vkz).then(
      (results) => {
        if (active && results.length === 1) {
          initialSearch.onSelect(results[0]);
          setIsLinked(true);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [initialSearch]);

  useEffect(() => {
    if (!isFocused) {
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
  }, [debouncedQuery, isFocused, vkz]);

  const inputRef = useRef<HTMLInputElement>(null);

  const keepInputFocusedOnSelect = (event: MouseEvent) =>
    event.preventDefault();

  const handleSelect = (candidate: DsbPlayerCandidate) => {
    onSelect(candidate);
    setIsLinked(true);
    inputRef.current?.blur();
  };

  return (
    <Command shouldFilter={false} className="rounded-md border">
      <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <CommandPrimitive.Input
          ref={inputRef}
          placeholder="Vor- und Nachname eingeben…"
          value={query}
          onValueChange={(value) => {
            setIsLinked(false);
            setQuery(value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isLinked ? (
          <Paperclip className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        ) : null}
        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>
      {isFocused ? (
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
                  className="items-start px-3 py-2.5 data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground"
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
      <Skeleton className="h-3.5 w-2/3 bg-foreground/10" />
      <Skeleton className="h-2.5 w-1/2 bg-foreground/10" />
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
