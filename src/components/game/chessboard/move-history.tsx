"use client";

import clsx from "clsx";

type Props = {
  /** Verbose move objects (must at least have `san`). */
  history: { san: string }[];
  /** 0‑based ply index of the current board position (‑1 = before first move). */
  currentMoveIndex: number;
  /** Jump to the given ply index. */
  goToMove: (ply: number) => void;
};

/**
 * Renders the moves in two columns (white / black) and highlights the cell
 * whose ply index equals `currentMoveIndex`.
 */
function MoveHistory({ history, currentMoveIndex, goToMove }: Props) {
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < history.length; i += 2) {
    const white = history[i];
    const black = history[i + 1];

    const whitePly = i;
    const blackPly = i + 1;

    rows.push(
      <tr key={i} className="align-top">
        <td className="pr-1 text-right select-none">{i / 2 + 1}.</td>
        <td
          className={clsx(
            "pr-2 cursor-pointer",
            currentMoveIndex === whitePly && "text-red-600 font-semibold",
          )}
          onClick={() => goToMove(whitePly)}
        >
          {white ? white.san : "…"}
        </td>
        <td
          className={clsx(
            "cursor-pointer",
            currentMoveIndex === blackPly && "text-red-600 font-semibold",
          )}
          onClick={() => goToMove(blackPly)}
        >
          {black ? black.san : "…"}
        </td>
      </tr>,
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-1">
      <table className="text-sm leading-5">
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default MoveHistory;
