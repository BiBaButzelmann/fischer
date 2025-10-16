import z from "zod";
import { GameWithParticipantsAndPGNAndDate } from "@/db/types/game";
import { getGameById } from "@/db/repositories/game";
import { auth } from "@/auth/utils";
import { redirect } from "next/navigation";
import { getUserGameRights, isGameActuallyPlayed } from "@/lib/game-auth";
import PgnViewer from "@/components/game/chessboard/pgn-viewer";
import PgnEditor from "@/components/game/chessboard/pgn-editor";
import { Suspense } from "react";
import { ChessProvider } from "@/contexts/chess-context";

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
  const game = await getGameById(gameId);
  if (!game) {
    return (
      <p className="p-4 text-red-600">
        Die Partie mit der ID {gameId} wurde nicht gefunden.
      </p>
    );
  }

  const userRights = await getUserGameRights(gameId, session.user.id);
  if (!userRights) {
    return (
      <div className="p-4">
        <p className="text-red-600">
          Du bist nicht berechtigt, diese Partie anzuzeigen.
        </p>
      </div>
    );
  }

  if (!isGameActuallyPlayed(game.result)) {
    return (
      <p className="p-4 text-red-600">
        Diese Partie kann nicht eingegeben werden, da sie nicht gespielt wurde.
      </p>
    );
  }

  return (
    <Suspense fallback={<p className="p-4">Loading game...</p>}>
      <PgnContainer allowEdit={userRights === "edit"} game={game} />
    </Suspense>
  );
}

async function PgnContainer({
  game,
  allowEdit,
}: {
  game: GameWithParticipantsAndPGNAndDate;
  allowEdit: boolean;
}) {
  if (!game.whiteParticipant || !game.blackParticipant) {
    return (
      <p className="p-4 text-red-600">
        Bye Runden können nicht eingegeben werden.
      </p>
    );
  }

  return (
    <ChessProvider game={game}>
      {allowEdit ? (
        <PgnEditor
          gameId={game.id}
          whitePlayer={game.whiteParticipant}
          blackPlayer={game.blackParticipant}
          gameResult={game.result!}
        />
      ) : (
        <PgnViewer
          gameId={game.id}
          whitePlayer={game.whiteParticipant}
          blackPlayer={game.blackParticipant}
          gameResult={game.result!}
        />
      )}
    </ChessProvider>
  );
}
