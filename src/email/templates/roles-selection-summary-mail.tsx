import { RolesData } from "@/db/types/role";

type Props = {
  name: string;
  roles: RolesData;
};

export function RoleSelectionSummaryMail({ name, roles }: Props) {
  const { participant, juror, referee, setupHelper } = roles;

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
        vielen Dank für deine Auswahl. Hier ist eine Zusammenfassung der von dir
        gewählten Rollen:
      </p>
      <ul style={{ paddingLeft: 20, listStyleType: "disc" }}>
        {participant && <li style={{ paddingBottom: 4 }}>Teilnehmer</li>}
        {juror && <li style={{ paddingBottom: 4 }}>Juror</li>}
        {referee && (
          <li style={{ paddingBottom: 4 }}>
            Schiedsrichter – Bevorzugter Spieltag: {referee.preferredMatchDay};
            Sekundäre Spieltage: {referee.secondaryMatchDays}
          </li>
        )}
        {setupHelper && (
          <li style={{ paddingBottom: 4 }}>
            Aufbauhelfer – Bevorzugter Spieltag: {setupHelper.preferredMatchDay}
            ; Sekundäre Spieltage: {setupHelper.secondaryMatchDays}
          </li>
        )}
      </ul>

      <p>Bei Fragen stehen wir dir jederzeit gerne zur Verfügung.</p>
      <p>
        Viele Grüße,
        <br />
        Dein HSK-Team
      </p>
    </div>
  );
}
