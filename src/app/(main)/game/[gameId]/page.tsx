import { db } from "@/db/client";
import ChessGameContainer from "@/components/chessboard/chess-game-container";
import z from "zod";
import { getParticipantFullName } from "@/utils/participant";
import { ParticipantWithName } from "@/db/types/participant";

const INITIAL_PGN = `[\nEvent "?"\nSite "?"\nDate "????.??.??"\nRound "?"\nWhite "?"\nBlack "?"\nResult "*"\n]\n\n*`;

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GamePage({ params }: PageProps) {
  const { gameId } = await params;

  const parsedGameIdResult = z.coerce.number().safeParse(gameId);
  if (!parsedGameIdResult.success) {
    return <p className="p-4 text-red-600">Invalid game ID.</p>;
  }

  const game = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, parsedGameIdResult.data),
    with: {
      whiteParticipant: {
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      blackParticipant: {
        with: {
          profile: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      pgn: true,
    },
  });

  if (!game) {
    return <p className="p-4 text-red-600">Game with ID {gameId} not found.</p>;
  }

  const whiteDisplay = formatDisplayName(game.whiteParticipant);
  const blackDisplay = formatDisplayName(game.blackParticipant);
  const pgn = game.pgn.value ?? INITIAL_PGN;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">
        {whiteDisplay} vs {blackDisplay}
      </h1>

      <ChessGameContainer gameId={parsedGameIdResult.data} initialPGN={pgn} />
    </div>
  );
}

const formatDisplayName = (p: ParticipantWithName) => {
  const rating = p.fideRating ?? p.dwzRating;
  return `${getParticipantFullName(p)}${rating ? ` (${rating})` : ""}`;
};
