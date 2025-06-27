"use client";

import { Button } from "@/components/ui/button";
import { Group, GroupWithGames } from "@/db/types/group";
import { useTransition } from "react";
import { scheduleGames } from "./actions/games";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameWithParticipants } from "@/db/types/game";

export function Pairings({ groups }: { groups: GroupWithGames[] }) {
  const [isPending, startTransition] = useTransition();

  const handleGenerateGames = () => {
    startTransition(async () => {
      await scheduleGames(1); // Replace with actual tournament ID
    });
  };

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
