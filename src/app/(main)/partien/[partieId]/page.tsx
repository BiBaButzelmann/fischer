import z from "zod";
import { getParticipantFullName } from "@/lib/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { getGameById } from "@/db/repositories/game";
import { auth } from "@/auth/utils";
import { redirect } from "next/navigation";
import { isUserAuthorizedForPGN, isGameActuallyPlayed } from "@/lib/game-auth";
import PgnViewer from "@/components/game/chessboard/pgn-viewer";
import { Suspense } from "react";
import { DateTime } from "luxon";
import { getGameTimeFromGame } from "@/lib/game-time";

type Props = {
  params: Promise<{ partieId: string }>;
};

export default async function GamePage({ params }: Props) {
  const { partieId: gameIdParam } = await params;

  const session = await auth();
  if (session == null) {
    redirect("/partien");
  }

  const parsedGameIdResult = z.coerce.number().safeParse(gameIdParam);
  if (!parsedGameIdResult.success) {
    return <p className="p-4 text-red-600">Invalid game ID.</p>;
  }

  const gameId = parsedGameIdResult.data;

  const isAuthorized = await isUserAuthorizedForPGN(
    gameId,
    session.user.id,
    session.user.role === "admin",
  );

  const game = await getGameById(gameId);
  if (!game) {
    return <p className="p-4 text-red-600">Game with ID {gameId} not found.</p>;
  }

  if (!isGameActuallyPlayed(game.result)) {
    return (
      <p className="p-4 text-red-600">
        Diese Partie kann nicht eingegeben werden, da sie nicht gespielt wurde.
      </p>
    );
  }

  if (isAuthorized) {
    return <PgnContainer allowEdit={true} gameId={gameId} />;
  }

  return (
    <Suspense fallback={<p className="p-4">Loading game...</p>}>
      <PgnContainer allowEdit={false} gameId={gameId} />
    </Suspense>
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

  if (!game.whiteParticipant || !game.blackParticipant) {
    return (
      <p className="p-4 text-red-600">
        Bye Runden können nicht eingegeben werden.
      </p>
    );
  }

  const whiteDisplay = formatDisplayName(game.whiteParticipant);
  const blackDisplay = formatDisplayName(game.blackParticipant);

  const gameDateTime = getGameTimeFromGame(game);

  const pgn =
    game.pgn != null
      ? game.pgn.value
      : getInitialPGN(
          game.tournament.name,
          gameDateTime,
          game.round,
          whiteDisplay,
          blackDisplay,
        );

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">
        {whiteDisplay} vs {blackDisplay}
      </h1>

      <PgnViewer gameId={gameId} initialPGN={pgn} allowEdit={allowEdit} />
    </div>
  );
}

function formatDisplayName(p: ParticipantWithName) {
  const rating = p.fideRating ?? p.dwzRating;
  return `${getParticipantFullName(p)}${rating ? ` (${rating})` : ""}`;
}

function getInitialPGN(
  tournamentName: string,
  date: Date,
  round: number,
  whiteParticipant: string,
  blackParticipant: string,
) {
  return `[Event "${tournamentName}"]\n[Site "https://klubturnier.hsk1830.de"]\n[Date "${DateTime.fromJSDate(date).toFormat("dd.MM.yyyy")}"]\n[Round "${round}"]\n[White "${whiteParticipant}"]\n[Black "${blackParticipant}"]\n[Result "*"]\n\n*`;
}
