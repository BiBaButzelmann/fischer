"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { tournamentPath } from "@/lib/navigation";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";

type Props = {
  tournaments: { id: number; name: string; slug: string }[];
  defaultSlug?: string;
};

export function TournamentSwitcher({ tournaments, defaultSlug }: Props) {
  const router = useRouter();
  const routeSlug = useTournamentSlug();
  const slug = routeSlug ?? defaultSlug;

  if (tournaments.length === 0) {
    return null;
  }

  return (
    <Select
      value={slug}
      onValueChange={(newSlug) =>
        router.push(tournamentPath(newSlug, "/uebersicht"))
      }
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Turnier wählen" />
      </SelectTrigger>
      <SelectContent>
        {tournaments.map((tournament) => (
          <SelectItem key={tournament.id} value={tournament.slug}>
            {tournament.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
