import { ChessGameContainer } from "@/components/chessboard/chess-game-container";
import { db } from "@/db/client";

// Server component that provides the initial data
function getPlayerGroups() {
  return {
    A: [
      { id: "a1", white: "Magnus Carlsen", black: "Fabiano Caruana" },
      { id: "a2", white: "Ding Liren", black: "Ian Nepomniachtchi" },
      { id: "a3", white: "Hikaru Nakamura", black: "Wesley So" },
    ],
    B: [
      { id: "b1", white: "Anish Giri", black: "Maxime Vachier-Lagrave" },
      { id: "b2", white: "Levon Aronian", black: "Teimour Radjabov" },
      { id: "b3", white: "Alexander Grischuk", black: "Pentala Harikrishna" },
    ],
    C: [
      { id: "c1", white: "Vidit Gujrathi", black: "Sergey Karjakin" },
      { id: "c2", white: "Richard Rapport", black: "Jan-Krzysztof Duda" },
      { id: "c3", white: "Alireza Firouzja", black: "Shakhriyar Mamedyarov" },
    ],
    D: [
      { id: "d1", white: "Vladimir Kramnik", black: "Veselin Topalov" },
      { id: "d2", white: "Boris Gelfand", black: "Peter Svidler" },
      { id: "d3", white: "Dmitry Andreikin", black: "Radoslaw Wojtaszek" },
    ],
  };
}

export default async function GamesPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  /*const playerGroups = getPlayerGroups();
  const groups = db.query.group.findMany({
    // TODO: torunamentId is hardcoded
    where: (group, { eq }) => eq(group.tournamentId, 1),
  });*/

  const game = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, parseInt(gameId)),
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chess Game Analysis</h1>
        {/*<ChessGameContainer playerGroups={playerGroups} />*/}
      </div>
    </div>
  );
}
