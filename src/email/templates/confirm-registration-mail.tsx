import * as React from "react";

type Props = {
  name: string;
  email: string;
};

export function ConfirmRegistrationMail({ name, email }: Props) {
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
        deine Registrierung mit der E-Mail-Adresse <strong>{email}</strong> war
        erfolgreich!
      </p>
      <p>
        <strong style={{ color: "#e74c3c" }}>Wichtig:</strong> Dein Account
        wurde erstellt,{" "}
        <strong>
          aber du bist noch nicht für das Schachturnier angemeldet
        </strong>
        .
      </p>
      <p>
        Um an dem Turnier teilzunehmen, musst du dich jetzt noch unter folgendem
        Link anmelden:
      </p>
      <p>
        <a
          href="https://klubturnier.hsk1830.de/anmeldung"
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de/anmeldung
        </a>
      </p>
      <p>Ohne diese Anmeldung wirst du nicht im Turnier berücksichtigt.</p>
      <p>Bei Fragen stehen wir dir jederzeit gerne zur Verfügung.</p>
      <p>
        Viele Grüße,
        <br />
        Dein HSK-Team
      </p>
    </div>
  );
}
