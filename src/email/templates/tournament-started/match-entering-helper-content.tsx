import * as React from "react";
import { buildGameViewUrl } from "@/lib/navigation";

type Props = {
  tournamentId: number;
};

export function MatchEnteringHelperContent({ tournamentId }: Props) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ color: "#2c3e50", fontSize: "18px", marginBottom: "10px" }}>
        Deine Aufgaben als Eingabehelfer
      </h2>
      <p>
        Wir freuen uns sehr, dass du uns bei der Durchführung des Klubturniers
        als Eingabehelfer unterstützen möchtest!
      </p>
      <p>
        <strong>TODO: Implement match entering helper side and add URL</strong>
      </p>
    </div>
  );
}
