import * as React from "react";

type Props = {
  name: string;
};
// TODO: Kais Texte einbauen
export function TournamentStartedMail({ name }: Props) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ color: "#2c3e50" }}>Hallo {name},</h1>
      <p>
        <strong style={{ color: "#e74c3c" }}>Das Turnier ist gestartet!</strong>
      </p>
      <p>
        Das Schachturnier hat offiziell begonnen. Du kannst dich jetzt in das
        Turniersystem einloggen und deine Partien verfolgen.
      </p>
      <p>Besuche die Turnier-Website unter folgendem Link:</p>
      <p>
        <a
          href="https://klubturnier.hsk1830.de"
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de
        </a>
      </p>
      <p>
        Dort findest du alle Informationen. Viel Erfolg und spannende Partien!
      </p>
      <p>
        Bei Fragen stehen wir dir jederzeit gerne unter klubturnier@hsk1830.de
        zur Verfügung.
      </p>
      <p>
        Viele Grüße,
        <br />
        Dein HSK-Team
      </p>
    </div>
  );
}

export default TournamentStartedMail;
