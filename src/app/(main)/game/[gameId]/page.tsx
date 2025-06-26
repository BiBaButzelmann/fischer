import { db } from "@/db/client";
import { pgn } from "@/db/schema/pgn";
import { eq } from "drizzle-orm";
import ChessGameContainer from "@/components/chessboard/chess-game-container";
import z from "zod";
import { getParticipantFullName } from "@/utils/participant";

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

  const gameRow = await db.query.game.findFirst({
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
    },
  });

  if (!gameRow) {
    return <p className="p-4 text-red-600">Game with ID {gameId} not found.</p>;
  }
  const { whiteParticipant, blackParticipant } = gameRow;

  const formatDisplayName = (p: typeof whiteParticipant) => {
    if (!p) return "Unknown";

    const rating = p.fideRating ?? p.dwzRating;
    return `${getParticipantFullName(p)}${rating ? ` (${rating})` : ""}`;
  };

  const whiteDisplay = formatDisplayName(gameRow.whiteParticipant);
  const blackDisplay = formatDisplayName(gameRow.blackParticipant);

  let [pgnRow] = await db
    .select()
    .from(pgn)
    .where(eq(pgn.gameId, parsedGameIdResult.data));

  if (!pgnRow) {
    const [inserted] = await db
      .insert(pgn)
      .values({ gameId: parsedGameIdResult.data, value: INITIAL_PGN })
      .returning();
    pgnRow = inserted;
  }

  // 5. Define a server action so the client can persist edits to the PGN
  async function savePGN(newValue: string) {
    "use server";

    await db
      .insert(pgn)
      .values({ gameId: parsedGameIdResult.data!, value: newValue })
      .onConflictDoUpdate({
        target: pgn.gameId,
        set: { value: newValue },
      });
  }

  // 6. Render the interactive client component
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">
        {whiteDisplay} vs {blackDisplay}
      </h1>

      <ChessGameContainer initialPGN={pgnRow.value} savePGN={savePGN} />
    </div>
  );
}
