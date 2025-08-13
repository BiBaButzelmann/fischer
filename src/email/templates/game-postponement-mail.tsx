import * as React from "react";

type Props = {
  playerName: string;
  opponentName: string;
  postponingPlayerName: string;
  gameDetails: {
    round: number;
    groupName: string;
  };
  oldDate: string;
  newDate: string;
  contactInfo: {
    opponentEmail: string;
    opponentPhone?: string;
  };
};

export function GamePostponementMail({
  playerName,
  opponentName,
  postponingPlayerName,
  gameDetails,
  oldDate,
  newDate,
  contactInfo,
}: Props) {
  const isPlayerPostponing = playerName === postponingPlayerName;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ color: "#2c3e50" }}>Hallo {playerName},</h1>

      {isPlayerPostponing ? (
        <p>
          du hast deine Partie gegen <strong>{opponentName}</strong> erfolgreich
          verschoben.
        </p>
      ) : (
        <p>
          <strong>{postponingPlayerName}</strong> hat eure gemeinsame Partie
          verschoben.
        </p>
      )}

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "5px",
          margin: "20px 0",
        }}
      >
        <h3 style={{ color: "#2c3e50", marginTop: 0 }}>Partie Details:</h3>
        <p>
          <strong>Gegner:</strong> {opponentName}
        </p>
        <p>
          <strong>Runde:</strong> {gameDetails.round}
        </p>
        <p>
          <strong>Gruppe:</strong> {gameDetails.groupName}
        </p>
        <p>
          <strong>Ursprünglicher Termin:</strong> {oldDate}
        </p>
        <p>
          <strong>Neuer Termin:</strong> {newDate}
        </p>
      </div>

      {!isPlayerPostponing && (
        <div>
          <p>
            <strong style={{ color: "#e74c3c" }}>Wichtig:</strong> Solltest du
            mit dem Termin nicht einverstanden sein, sprich dich bitte umgehend
            mit deinem Gegner ab.
          </p>

          <div
            style={{
              backgroundColor: "#e8f4f8",
              padding: "15px",
              borderRadius: "5px",
              margin: "15px 0",
            }}
          >
            <h4 style={{ color: "#2c3e50", marginTop: 0 }}>
              Kontaktdaten deines Gegners:
            </h4>
            <p>
              <strong>E-Mail:</strong> {contactInfo.opponentEmail}
            </p>
            {contactInfo.opponentPhone && (
              <p>
                <strong>Telefon:</strong> {contactInfo.opponentPhone}
              </p>
            )}
          </div>
        </div>
      )}

      <p>
        Solltest du Probleme mit dem neuen Termin haben, wende dich bitte direkt
        an deinen Gegner oder kontaktiere uns unter klubturnier@hsk1830.de.
      </p>

      <p>
        Viel Erfolg bei eurer Partie!
        <br />
        <br />
        Viele Grüße,
        <br />
        Dein HSK-Team
      </p>
    </div>
  );
}
