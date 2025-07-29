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
import { DateTime } from "luxon";
import { GAME_START_TIME } from "@/constants/constants";

type PageProps = {
  params: Promise<{ partieId: string }>;
};

export default async function GamePage({ params }: PageProps) {
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

  if (
    (await gameBelongsToUser(gameId, session.user.id)) ||
    (await gameBelongsToMatchEnteringHelper()) ||
    session.user.role === "admin"
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

  if (!game.matchdayGame || !game.matchdayGame.matchday) {
    return (
      <p className="p-4 text-red-600">
        Game {gameId} has no matchday relation. Please check the game
        scheduling.
      </p>
    );
  }

  const whiteDisplay = formatDisplayName(game.whiteParticipant);
  const blackDisplay = formatDisplayName(game.blackParticipant);

  const matchdayDate = game.matchdayGame.matchday.date;
  const gameDateTime = new Date(matchdayDate);
  gameDateTime.setHours(
    GAME_START_TIME.hours,
    GAME_START_TIME.minutes,
    GAME_START_TIME.seconds,
  );

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

async function gameBelongsToUser(gameId: number, userId: string) {
  return await isUserParticipantInGame(gameId, userId);
}

async function gameBelongsToMatchEnteringHelper() {
  // TODO: Implement logic to check if the user is a match enterhin helper for the game
  return false;
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
