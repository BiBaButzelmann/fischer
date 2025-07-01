import * as React from "react";

type Props = {
  firstName: string;
  email: string;
  url: string;
};

export function PasswordResetMail({ firstName, email, url }: Props) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ color: "#2c3e50" }}>Hallo {firstName},</h1>
      <p>du hast kürzlich eine Zurücksetzung deines Passworts angefordert.</p>
      <p>Klicke auf den folgenden Link, um ein neues Passwort festzulegen:</p>
      <p>
        <a href={url} style={{ color: "#2980b9", fontWeight: "bold" }}>
          Passwort zurücksetzen
        </a>
      </p>
      <p>
        Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail
        ignorieren – es wurden keine Änderungen vorgenommen.
      </p>
      <p>Bei Fragen stehen wir dir jederzeit gerne zur Verfügung.</p>
      <p>
        Viele Grüße,
        <br />
        Dein HSK-Team
      </p>
    </div>
  );
}
