"use client";

import { Chessboard } from "react-chessboard";
import { PgnEditorSidepanel } from "./pgn-editor-sidepanel";
import { PlayerDisplay } from "./player-display";
import { PgnEditorActions } from "./pgn-actions";
import { ParticipantWithName } from "@/db/types/participant";
import { getIndividualPlayerResult } from "@/lib/game-result-utils";
import { GameResult } from "@/db/types/game";
import { useChessEditor } from "@/hooks/use-chess-editor";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  gameId: number;
  initialPGN: string;
  whitePlayer: ParticipantWithName;
  blackPlayer: ParticipantWithName;
  gameResult: GameResult;
};

export default function PgnEditor({
  gameId,
  initialPGN,
  whitePlayer,
  blackPlayer,
  gameResult,
}: Props) {
  const isMobile = useIsMobile();
  const {
    fen,
    onPieceDrop,
    onSquareClick,
    selectedSquare,
    moves,
    currentIndex,
    setCurrentIndex,
    setMoves,
    pgn,
  } = useChessEditor(initialPGN, gameId);

  if (isMobile) {
    return (
            <div className="flex flex-col h-[calc(100vh-92px)] gap-4">
        <div className="flex-shrink-0 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <PlayerDisplay
            participant={blackPlayer}
            result={getIndividualPlayerResult(gameResult, false)}
            className="rounded-t-lg"
          />

          <div className="aspect-square w-full">
            <Chessboard
              position={fen}
              arePiecesDraggable={true}
              onPieceDrop={onPieceDrop}
              onSquareClick={onSquareClick}
              animationDuration={0}
              customSquareStyles={{
                ...(selectedSquare && {
                  [selectedSquare]: {
                    boxShadow: "inset 0 0 1px 6px rgba(255,255,255,0.75)",
                  },
                }),
              }}
            />
          </div>

          <PlayerDisplay
            participant={whitePlayer}
            result={getIndividualPlayerResult(gameResult, true)}
            className="rounded-b-lg"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto bg-blue-200 p-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam
          delectus quas cumque omnis repellat vitae voluptate facilis rem minus
          recusandae, ad nihil sunt. Dicta suscipit exercitationem qui culpa!
          Fugiat, neque. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Sequi ducimus explicabo excepturi inventore nihil voluptate
          fugit sed quaerat amet repellendus dolorem, quam molestias minus,
          aperiam at! Saepe nam sequi excepturi? Lorem ipsum, dolor sit amet
          consectetur adipisicing elit. Sit unde nisi sunt illo, beatae omnis
          earum ad possimus ipsum neque eum soluta minima id sint ratione.
          Nesciunt aperiam itaque repudiandae. Lorem ipsum dolor sit amet
          consectetur adipisicing elit. Voluptates, dolore impedit. Perferendis
          dolorem fugit repudiandae ex molestias amet incidunt, deleniti
          accusantium nostrum voluptates voluptas corporis repellendus
          dignissimos, ratione saepe id? Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Nobis, incidunt porro animi dicta impedit nesciunt
          quod ex obcaecati repellat itaque voluptatum ea nam inventore deleniti
          eaque eveniet qui ullam dolorem! Lorem ipsum, dolor sit amet
          consectetur adipisicing elit. Veritatis ea, voluptas distinctio earum
          unde natus illum neque illo possimus? Repudiandae saepe voluptatem
          fugit unde quos non earum, voluptatibus dolorum dolores.
        </div>

        <div className="flex-shrink-0">
          <PgnEditorActions
            pgn={pgn}
            gameId={gameId}
            setMoves={setMoves}
            setCurrentIndex={setCurrentIndex}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <div className="flex-shrink-0 w-full max-w-lg mx-auto lg:mx-0 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <PlayerDisplay
          participant={blackPlayer}
          result={getIndividualPlayerResult(gameResult, false)}
          className="rounded-t-lg"
        />

        <div className="aspect-square w-full">
          <Chessboard
            position={fen}
            arePiecesDraggable={true}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            animationDuration={0}
            customSquareStyles={{
              ...(selectedSquare && {
                [selectedSquare]: {
                  boxShadow: "inset 0 0 1px 6px rgba(255,255,255,0.75)",
                },
              }),
            }}
          />
        </div>

        <PlayerDisplay
          participant={whitePlayer}
          result={getIndividualPlayerResult(gameResult, true)}
          className="rounded-b-lg"
        />
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <PgnEditorSidepanel
          moves={moves}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          setMoves={setMoves}
          pgn={pgn}
          gameId={gameId}
          fen={fen}
        />
      </div>
    </div>
  );
}
