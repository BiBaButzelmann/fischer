"use client";

import { Button } from "@/components/ui/button";
import { Group, GroupWithGames } from "@/db/types/group";
import { useTransition } from "react";
import { scheduleGames } from "@/actions/game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameWithParticipants } from "@/db/types/game";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Pairings({ groups }: { groups: GroupWithGames[] }) {
  const [isPending, startTransition] = useTransition();

  const handleGenerateGames = () => {
    startTransition(async () => {
      await scheduleGames(1); // Replace with actual tournament ID
    });
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Gruppen gefunden. Erstellen Sie zuerst Gruppen.
      </div>
    );
  }

  if (!hasGamesScheduled(groups)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <span>Keine Partien angesetzt</span>
        <Button onClick={handleGenerateGames} disabled={isPending}>
          Partien generieren
        </Button>
      </div>
    );
  }

  const groupedGames = groupGamesByGroupAndRound(groups);

  // If only one group, show rounds as tabs
  if (groups.length === 1 && groupedGames.length === 1) {
    const { gamesByRound } = groupedGames[0];
    const rounds = Array.from(gamesByRound.keys()).sort((a, b) => a - b);

    if (rounds.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <span>Keine Partien angesetzt</span>
          <Button onClick={handleGenerateGames} disabled={isPending}>
            Partien generieren
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full">
        <Tabs defaultValue={`round-${rounds[0]}`} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 xl:grid-cols-9">
            {rounds.map((round) => (
              <TabsTrigger
                key={round}
                value={`round-${round}`}
                className="text-sm"
              >
                Round {round}
              </TabsTrigger>
            ))}
          </TabsList>

          {rounds.map((round) => {
            const games = gamesByRound.get(round) || [];
            return (
              <TabsContent
                key={round}
                value={`round-${round}`}
                className="mt-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Round {round} on{" "}
                    {games[0]?.scheduled.toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="font-semibold grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                      <div>Bo.</div>
                      <div>White</div>
                      <div>Black</div>
                    </div>
                  </div>

                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 text-sm"
                    >
                      <div className="font-medium">{game.boardNumber}</div>
                      <div className="text-blue-600">
                        {game.whiteParticipant.profile.firstName}{" "}
                        {game.whiteParticipant.profile.lastName}
                      </div>
                      <div className="text-blue-600">
                        {game.blackParticipant.profile.firstName}{" "}
                        {game.blackParticipant.profile.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
  }

  // Multiple groups - show as cards (original behavior)
  return (
    <div className="flex flex-col gap-4">
      {groupedGames.map(({ group, gamesByRound }) => (
        <GroupCard name={group.groupName} key={group.id}>
          {Array.from(gamesByRound.entries()).map(([round, games]) => (
            <div key={group.id + "-" + round} className="ml-4 mt-1">
              <p className="font-semibold">Runde {round}</p>
              {games.map((game) => (
                <div key={game.id} className="flex items-center gap-2">
                  <span className="font-semibold">{game.boardNumber}</span>
                  <span>
                    {game.scheduled.toLocaleString("de-DE", {
                      dateStyle: "short",
                      timeZone: "Europe/Berlin",
                    })}
                  </span>
                  <span>
                    {game.whiteParticipant.profile.firstName}{" "}
                    {game.whiteParticipant.profile.lastName} vs{" "}
                    {game.blackParticipant.profile.firstName}{" "}
                    {game.blackParticipant.profile.lastName}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </GroupCard>
      ))}
    </div>
  );
}

function GroupCard({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

type GroupedResult = {
  group: Group;
  gamesByRound: Map<number, GameWithParticipants[]>;
};

function groupGamesByGroupAndRound(groups: GroupWithGames[]): GroupedResult[] {
  const result: GroupedResult[] = groups.map(({ games, ...group }) => {
    const gamesByRoundMap = games.reduce((acc, game) => {
      if (!acc.has(game.round)) {
        acc.set(game.round, []);
      }
      acc.get(game.round)!.push(game);
      return acc;
    }, new Map<number, GameWithParticipants[]>());

    return {
      group,
      gamesByRound: gamesByRoundMap,
    };
  });

  result.sort((a, b) => a.group.groupNumber - b.group.groupNumber);

  return result;
}

function hasGamesScheduled(groups: GroupWithGames[]) {
  return groups.every((group) => group.games.length > 0);
}
