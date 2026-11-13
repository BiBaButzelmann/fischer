"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";
import { tournamentPath } from "@/lib/navigation";

type Props = {
  displayName: string;
  profileId: number;
  children: ReactNode;
};

export function RowActions({ displayName, profileId, children }: Props) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground"
          aria-label={`Aktionen für ${displayName}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-mono text-xs font-normal text-muted-foreground">
          Profil-ID {profileId}
        </DropdownMenuLabel>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HistoryMenuItem({ profileId }: { profileId: number }) {
  const slug = useTournamentSlug();

  return (
    <DropdownMenuItem asChild>
      <Link
        href={tournamentPath(slug, `/admin/logging?profileId=${profileId}`)}
      >
        Verlauf ansehen
      </Link>
    </DropdownMenuItem>
  );
}
