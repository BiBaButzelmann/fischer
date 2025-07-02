import { Role } from "@/db/types/role";

type Props = {
  name: string;
  roles: Role[];
};

export function RoleSelectionSummaryMail({ name, roles }: Props) {
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
      <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
        {roles.map((role, index) => (
          <li key={index} style={{ paddingBottom: "4px" }}>
            {role}
          </li>
        ))}
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
