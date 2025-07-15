"use client";

import { GroupWithGames } from "@/db/types/group";
import { GameWithParticipants } from "@/db/types/game";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantEntry } from "../groups/participant-entry";

export function SingleGroupPairings({ group }: { group?: GroupWithGames }) {
  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-500">
        <span>Keine Gruppe ausgewählt</span>
      </div>
    );
  }

  if (!group.games || group.games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-500">
        <span>
          Keine Partien angesetzt für{" "}
          {group.groupName || `Gruppe ${group.groupNumber}`}
        </span>
        <p className="text-sm">
          Verwenden Sie "Gruppeneinteilung speichern & Paarungen generieren" um
          Partien zu erstellen.
        </p>
      </div>
    );
  }

  // Group games by round
  const gamesByRound = group.games.reduce((acc, game) => {
    if (!acc.has(game.round)) {
      acc.set(game.round, []);
    }
    acc.get(game.round)!.push(game);
    return acc;
  }, new Map<number, GameWithParticipants[]>());

  const rounds = Array.from(gamesByRound.keys()).sort((a, b) => a - b);

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-500">
        <span>Keine Partien angesetzt</span>
        <p className="text-sm">
          Verwenden Sie "Gruppeneinteilung speichern & Paarungen generieren" um
          Partien zu erstellen.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue={`round-${rounds[0]}`} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 mb-6">
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
            <TabsContent key={round} value={`round-${round}`} className="mt-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Header Section */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Round {round} on{" "}
                    {games[0]?.scheduled.toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </h3>
                </div>

                {/* Table Content */}
                <div className="overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-3 gap-6 px-6 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                    <div>Bo.</div>
                    <div>White</div>
                    <div>Black</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-gray-100">
                    {games.map((game, index) => (
                      <div
                        key={game.id}
                        className={`grid grid-cols-3 gap-6 px-6 py-4 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <div className="font-semibold text-gray-900">
                          {game.boardNumber}
                        </div>
                        <div>
                          <ParticipantEntry
                            participant={game.whiteParticipant}
                            showMatchDays={false}
                            showFideRating={false}
                            showDwzRating={false}
                          />
                        </div>
                        <div>
                          <ParticipantEntry
                            participant={game.blackParticipant}
                            showMatchDays={false}
                            showFideRating={false}
                            showDwzRating={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
