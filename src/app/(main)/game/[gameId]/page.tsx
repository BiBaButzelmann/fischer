import z from "zod";
import { getParticipantFullName } from "@/lib/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { getGameById, isUserParticipantInGame } from "@/db/repositories/game";
import { auth } from "@/auth/utils";
import { redirect } from "next/navigation";
import { PasswordProtection } from "@/components/game/password-protection";
import { verifyPgnPassword } from "@/actions/game";
import PgnViewer from "@/components/game/chessboard/pgn-viewer";
import { Suspense } from "react";

const INITIAL_PGN = `[\nEvent "?"\nSite "?"\nDate "????.??.??"\nRound "?"\nWhite "?"\nBlack "?"\nResult "*"\n]\n\n*`;

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GamePage({ params }: PageProps) {
  const { gameId: gameIdParam } = await params;

  const session = await auth();
  if (session == null) {
    redirect("/games");
  }

  const parsedGameIdResult = z.coerce.number().safeParse(gameIdParam);
  if (!parsedGameIdResult.success) {
    return <p className="p-4 text-red-600">Invalid game ID.</p>;
  }

  const gameId = parsedGameIdResult.data;

  if (
    (await gameBelongsToUser(gameId, session.user.id)) ||
    (await gameBelongsToReferee(gameId, session.user.id))
  ) {
    return <PgnContainer allowEdit={true} gameId={gameId} />;
  }

  return (
    <PasswordProtection gameId={gameId} onVerify={verifyPgnPassword}>
      <Suspense fallback={<p className="p-4">Loading game...</p>}>
        <PgnContainer allowEdit={false} gameId={gameId} />
      </Suspense>
    </PasswordProtection>
  );
}

async function PgnContainer({
  gameId,
  allowEdit,
}: {
  gameId: number;
  allowEdit: boolean;
}) {
  const game = await getGameById(gameId);
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

      <PgnViewer gameId={gameId} initialPGN={pgn} allowEdit={allowEdit} />
    </div>
  );
}

async function gameBelongsToUser(gameId: number, userId: string) {
  return await isUserParticipantInGame(gameId, userId);
}

async function gameBelongsToReferee(gameId: number, userId: string) {
  // TODO: Implement logic to check if the user is a referee for the game
  return false;
}

const formatDisplayName = (p: ParticipantWithName) => {
  const rating = p.fideRating ?? p.dwzRating;
  return `${getParticipantFullName(p)}${rating ? ` (${rating})` : ""}`;
};
