"use client";

import { useRouter } from "next/navigation";
import { Grid3x3, ListOrdered } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildResultsViewUrl, type StandingsView } from "@/lib/navigation";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";

type Props = {
  view: StandingsView;
  selectedGroupId?: string;
  selectedRound?: string;
};

export function StandingsTabs({ view, selectedGroupId, selectedRound }: Props) {
  const router = useRouter();
  const slug = useTournamentSlug();

  const handleViewChange = (value: string) => {
    router.push(
      buildResultsViewUrl({
        slug,
        groupId: selectedGroupId,
        round: selectedRound,
        view: value as StandingsView,
      }),
    );
  };

  return (
    <Tabs value={view} onValueChange={handleViewChange}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="tabelle" className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4" />
          Tabelle
        </TabsTrigger>
        <TabsTrigger value="kreuztabelle" className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4" />
          Kreuztabelle
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
