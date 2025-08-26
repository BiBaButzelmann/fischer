import * as React from "react";
import { buildGameViewUrl } from "@/lib/navigation";

type Props = {
  tournamentId: number;
};

export function SetupHelperContent({ tournamentId }: Props) {
  const gameUrl = buildGameViewUrl({ tournamentId });

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ color: "#2c3e50", fontSize: "18px", marginBottom: "10px" }}>
        Deine Aufgaben als Aufbauhelfer
      </h2>
      <p>
        Wir freuen uns sehr, dass du uns bei der Durchführung des Klubturniers
        als Aufbauhelfer unterstützen möchtest!
      </p>
      <p>
        Sei bitte möglichst so rechtzeitig da, dass die Vorbereitung 10 Minuten
        vor Rundenbeginn abgeschlossen ist.
      </p>
      <p>
        Eine Liste der Paarungen des jeweiligen Spieltages einschließlich der
        verlegten Partien findest du unter{" "}
        <a
          href={`https://klubturnier.hsk1830.de${gameUrl}`}
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de{gameUrl}
        </a>
      </p>
      <p>
        Wenn du einmal krank oder aus einem anderen Grund verhindert bist,
        informiere bitte möglichst frühzeitig die Turnierleitung.
      </p>
    </div>
  );
}
