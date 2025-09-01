"use client";

import { GroupWithParticipantsAndGames } from "@/db/types/group";
import { GameWithMatchday } from "@/db/types/game";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantEntry } from "../groups/participant-entry";
import { Bird } from "lucide-react";
import { getDateTimeFromDefaultTime, formatGameDate } from "@/lib/game-time";
import { isSameDate } from "@/lib/date";

export function Pairing({ group }: { group: GroupWithParticipantsAndGames }) {
  if (!group.games || group.games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-500">
        <span>
          Keine Partien angesetzt für{" "}
          {group.groupName || `Gruppe ${group.groupNumber}`}
        </span>
        <p className="text-sm">
          Verwende Paarungen generieren, um Partien zu erstellen.
        </p>
      </div>
    );
  }

  const findParticipant = (participantId: number) => {
    return group.participants.find((p) => p.id === participantId);
  };

  const ParticipantCell = ({
    participantId,
    matchdayDate,
  }: {
    participantId: number;
    matchdayDate: Date;
  }) => {
    const participant = findParticipant(participantId);

    if (!participant) {
      return (
        <div className="flex items-center gap-2 py-1">
          <Bird className="h-4 w-4 text-amber-700" />
          <p className="font-semibold flex-grow truncate text-red-700">
            spielfrei
          </p>
        </div>
      );
    }

    const isNotAvailable =
      participant.notAvailableDays?.some((notAvailableDate) => {
        // TODO: HOTFIX: Add 1 day to compensate for timezone offset in existing database data
        const adjustedDate = new Date(notAvailableDate);
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        return isSameDate(adjustedDate, matchdayDate);
      }) || false;

    return (
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded ${
          isNotAvailable ? "bg-red-100 border border-red-300" : ""
        }`}
      >
        <ParticipantEntry
          participant={participant}
          showMatchDays={false}
          showFideRating={false}
          showDwzRating={false}
        />
      </div>
    );
  };

  const gamesByRound = group.games.reduce((acc, game) => {
    if (!acc.has(game.round)) {
      acc.set(game.round, []);
    }
    acc.get(game.round)!.push(game);
    return acc;
  }, new Map<number, GameWithMatchday[]>());

  const rounds = Array.from(gamesByRound.keys()).sort((a, b) => a - b);

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-gray-500">
        <span>Keine Partien angesetzt</span>
        <p className="text-sm">
          Verwende Paarungen generieren, um Partien zu erstellen.
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
              Runde {round}
            </TabsTrigger>
          ))}
        </TabsList>

        {rounds.map((round) => {
          const games = gamesByRound.get(round) || [];

          const gameDateTime = getDateTimeFromDefaultTime(
            games[0].matchdayGame.matchday.date,
          );
          const dateDisplay = formatGameDate(gameDateTime);

          return (
            <TabsContent key={round} value={`round-${round}`} className="mt-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Runde {round} am {dateDisplay}
                  </h3>
                </div>

                <div className="overflow-hidden">
                  <div className="grid grid-cols-[80px_1fr_1fr] gap-6 px-6 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                    <div>Brett</div>
                    <div>Weiß</div>
                    <div>Schwarz</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {games.map((game, index) => (
                      <div
                        key={game.id}
                        className={`grid grid-cols-[80px_1fr_1fr] gap-6 px-6 py-4 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <div className="font-semibold text-gray-900">
                          {game.boardNumber}
                        </div>
                        <div>
                          <ParticipantCell
                            participantId={game.whiteParticipantId!}
                            matchdayDate={gameDateTime}
                          />
                        </div>
                        <div>
                          <ParticipantCell
                            participantId={game.blackParticipantId!}
                            matchdayDate={gameDateTime}
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
