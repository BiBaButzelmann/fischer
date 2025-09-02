import * as React from "react";

export function MatchEnteringHelperContent() {
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
        Deine Aufgabe ist es, die dir zugeteilten Partien direkt auf der
        Webseite in einem integrierten Schachbrett einzugeben.
      </p>
      <p>
        Die Partieneingabe findest du unter folgendem Link:
        <br />{" "}
        <a
          href="https://klubturnier.hsk1830.de/partieneingabe"
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de/partieneingabe
        </a>
      </p>
      <p>
        Dort findest du alle dir zugewiesenen Partien und kannst sie direkt
        eingeben.
      </p>
    </div>
  );
}
