import * as React from "react";
import { buildGameViewUrl } from "@/lib/navigation";

type Props = {
  tournamentId: number;
};

export function RefereeContent({ tournamentId }: Props) {
  const gameUrl = buildGameViewUrl({ tournamentId });

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ color: "#2c3e50", fontSize: "18px", marginBottom: "10px" }}>
        Deine Aufgaben als Schiedsrichter
      </h2>
      <p>
        Wir freuen uns sehr, dass du uns bei der Durchführung des Klubturniers
        als Schiedsrichter unterstützen möchtest!
      </p>
      <p>
        Sei bitte möglichst so rechtzeitig da, dass du die aufgebauten Partien
        auf Richtigkeit und Vollständigkeit überprüfen kannst.
      </p>
      <p>
        Zu deinen Aufgaben gehört neben der reinen Schiedsrichterei auch die
        Eingabe der Ergebnisse.
      </p>
      <p>
        Hierfür findest Du eine Liste der Paarungen des jeweiligen Spieltages
        einschließlich der verlegten Partien unter{" "}
        <a
          href={`https://klubturnier.hsk1830.de${gameUrl}`}
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de{gameUrl}
        </a>
        .
      </p>
      <p>
        Das ist in der A- und der B-Klasse besonders wichtig, weil die FIDE bei
        den ELO-ausgewerteten Turnieren die Ergebnisse manchmal noch am selben
        Tag benötigt.
      </p>
      <p>
        Wenn du einmal krank oder aus einem anderen Grund verhindert bist,
        informiere bitte möglichst frühzeitig die Turnierleitung.
      </p>
    </div>
  );
}
