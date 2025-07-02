import ChessGameContainer from "@/components/chessboard/chess-game-container";
import z from "zod";
import { getParticipantFullName } from "@/lib/participant";
import { ParticipantWithName } from "@/db/types/participant";
import { getGameById, isUserParticipantInGame } from "@/db/repositories/game";
import { auth } from "@/auth/utils";
import { redirect } from "next/navigation";

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
    return <div>Hier soll der PGN editor angezeigt werden</div>;
  }

  return (
    <div>Hier soll der Passwort geschützte PGN viewer angezeigt werden</div>
  );

  // const game = await getGameById(parsedGameIdResult.data);
  // if (!game) {
  //   return <p className="p-4 text-red-600">Game with ID {gameId} not found.</p>;
  // }

  // const whiteDisplay = formatDisplayName(game.whiteParticipant);
  // const blackDisplay = formatDisplayName(game.blackParticipant);
  // const pgn = game.pgn.value ?? INITIAL_PGN;

  // return (
  //   <div className="p-4">
  //     <h1 className="mb-4 text-2xl font-semibold">
  //       {whiteDisplay} vs {blackDisplay}
  //     </h1>

  //     <ChessGameContainer gameId={parsedGameIdResult.data} initialPGN={pgn} />
  //   </div>
  // );
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
