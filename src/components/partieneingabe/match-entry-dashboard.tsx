"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GameWithParticipantsAndPGN } from "@/db/types/game";

type Props = {
  pendingGames: GameWithParticipantsAndPGN[];
  completedGames: GameWithParticipantsAndPGN[];
};

export function MatchEntryDashboard({ pendingGames, completedGames }: Props) {
  const getPlayerName = (
    participant: GameWithParticipantsAndPGN["whiteParticipant"],
  ) => {
    if (!participant) return "Unbekannt";
    return `${participant.profile.firstName} ${participant.profile.lastName}`;
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Meine Partieneingabe
              </h1>
              <p className="text-slate-600 mt-1">
                Ihnen zugewiesene Schachpartien zur Eingabe
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-700">
                  {pendingGames.length}
                </div>
                <div className="text-sm text-slate-500">
                  Ausstehende Partien
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Clock className="h-5 w-5" />
              Ausstehende Partieneingaben
              <Badge variant="secondary" className="ml-auto">
                {pendingGames.length} Partien
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-4">
                {pendingGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/partien/${game.id}`}
                    className="group border rounded-lg p-4 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        Runde {game.round}:{" "}
                        {getPlayerName(game.whiteParticipant)} vs{" "}
                        {getPlayerName(game.blackParticipant)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </Link>
                ))}

                {pendingGames.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">
                      Keine ausstehenden Partien
                    </p>
                    <p className="text-sm">
                      Alle Ihnen zugewiesenen Partien wurden eingegeben!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <CheckCircle2 className="h-5 w-5" />
              Abgeschlossene Eingaben
              <Badge variant="secondary" className="ml-auto">
                {completedGames.length} Partien
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="space-y-1 p-4">
                {completedGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/partien/${game.id}`}
                    className="border rounded-lg p-4 block hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        Runde {game.round}:{" "}
                        {getPlayerName(game.whiteParticipant)} vs{" "}
                        {getPlayerName(game.blackParticipant)}
                      </span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </Link>
                ))}

                {completedGames.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p>Noch keine abgeschlossenen Eingaben</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
