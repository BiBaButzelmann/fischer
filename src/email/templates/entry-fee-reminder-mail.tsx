import * as React from "react";

type Props = {
  firstName: string;
  lastName: string;
};

export function EntryFeeReminderMail({ firstName, lastName }: Props) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ color: "#2c3e50" }}>Hallo {firstName},</h1>

      <p>
        du hast dich zum diesjährigen HSK-Klubturnier angemeldet. Da du nicht
        HSK-Mitglied bist, musst du das Startgeld in Höhe von EUR 60 zahlen, um
        mitspielen zu können. Das ist bis heute nicht geschehen.
      </p>

      <p>
        Wenn du nicht mehr mitspielen willst, dann teile uns das bitte umgehend
        mit, damit wir die Gruppeneinteilung machen können.
      </p>

      <p>
        Wenn du doch mitspielen möchtest, solltest du die Überweisung möglichst
        umgehend auf den Weg bringen. Das Startgeld muss spätestens bis zum
        <strong style={{ color: "#e74c3c" }}> 10.09.25 </strong>
        auf dem HSK-Konto eingehen.
      </p>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          padding: "15px",
          margin: "20px 0",
        }}
      >
        <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
          Bankverbindung:
        </p>
        <p style={{ margin: "5px 0" }}>
          IBAN: <strong>DE86 2005 0550 1216 1326 86</strong>
        </p>
        <p style={{ margin: "5px 0" }}>
          Verwendungszweck:{" "}
          <strong>
            Klubturnier 2025 {firstName} {lastName}
          </strong>
        </p>
      </div>

      <p style={{ color: "#e74c3c", fontWeight: "bold" }}>
        Andernfalls erlischt die Startberechtigung.
      </p>

      <p>
        Mit freundlichen Grüßen
        <br />
        Dein HSK-Orgateam
      </p>
    </div>
  );
}
