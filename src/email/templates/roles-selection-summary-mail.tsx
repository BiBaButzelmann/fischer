import { DEFAULT_CLUB_LABEL, matchDays } from "@/constants/constants";
import { MatchDay } from "@/db/types/group";
import { RolesData } from "@/db/types/role";

type Props = {
  name: string;
  roles: RolesData;
};

const translateMatchDay = (day: MatchDay) => matchDays[day];

export default function RoleSelectionSummaryMail({ name, roles }: Props) {
  const listItems: React.ReactNode[] = [];

  if (roles.participant) {
    const p = roles.participant;
    listItems.push(
      <li key="participant" style={{ paddingBottom: 8 }}>
        <strong>Spieler</strong>
        <ul style={{ paddingLeft: 20, listStyleType: "circle" }}>
          <li>Schachverein: {p.chessClub}</li>
          {p.dwzRating && <li>DWZ: {p.dwzRating}</li>}
          {p.fideRating && <li>Elo: {p.fideRating}</li>}
          {p.fideId && <li>FIDE‑ID: {p.fideId}</li>}
          <li>
            Bevorzugter Spieltag: {translateMatchDay(p.preferredMatchDay)}
          </li>
          <li>
            Alternative Spieltage:{" "}
            {p.secondaryMatchDays.map(translateMatchDay).join(", ")}
          </li>
          {p.chessClub !== DEFAULT_CLUB_LABEL && p.entryFeePayed === false && (
            <li>
              Bitte überweise die Startgebühr von 60€ auf folgendes Konto:
              <br />
              IBAN: <strong>DE86 2005 0550 1216 1326 86 </strong>
              Verwendungszweck: <strong>Klubturnier 2025 [Vorname Name]</strong>
            </li>
          )}
        </ul>
      </li>,
    );
  }

  if (roles.referee) {
    const r = roles.referee;
    listItems.push(
      <li key="referee" style={{ paddingBottom: 8 }}>
        <strong>Schiedsrichter</strong> – Bevorzugter Spieltag:{" "}
        {translateMatchDay(r.preferredMatchDay)}; Alternative Spieltage:{" "}
        {r.secondaryMatchDays.map(translateMatchDay).join(", ")}
      </li>,
    );
  }

  if (roles.setupHelper) {
    const s = roles.setupHelper;
    listItems.push(
      <li key="setupHelper" style={{ paddingBottom: 8 }}>
        <strong>Aufbauhelfer</strong> – Bevorzugter Spieltag:{" "}
        {translateMatchDay(s.preferredMatchDay)}; Alternative Spieltage:{" "}
        {s.secondaryMatchDays.map(translateMatchDay).join(", ")}
      </li>,
    );
  }

  if (roles.matchEnteringHelper) {
    const m = roles.matchEnteringHelper;
    listItems.push(
      <li key="matchEnteringHelper" style={{ paddingBottom: 8 }}>
        <strong>Eingabehelfer</strong> – Anzahl Gruppen:{" "}
        {m.numberOfGroupsToEnter}
      </li>,
    );
  }

  if (roles.juror) {
    listItems.push(
      <li key="juror" style={{ paddingBottom: 8 }}>
        <strong>Mitglied des Schiedsgerichtes</strong>
      </li>,
    );
  }

  return (
    <div
      role="article"
      aria-roledescription="E‑Mail"
      style={{
        fontFamily: "Segoe UI, Arial, sans-serif",
        padding: 20,
        lineHeight: 1.6,
        fontSize: 16,
        color: "#2c3e50",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Hallo {name},</h1>
      <p style={{ marginBottom: 16 }}>
        Herzlichen Glückwunsch zur erfolgreichen Anmeldung zum Klubturnier des{" "}
        {DEFAULT_CLUB_LABEL}!<br />
        Hier ist eine Übersicht deiner ausgewählten Rollen:
      </p>
      <ul style={{ paddingLeft: 20, listStyleType: "disc" }}>{listItems}</ul>
      <p style={{ marginTop: 16 }}>
        Bei Fragen stehen wir dir jederzeit gerne zur Verfügung.
      </p>
      <p style={{ marginTop: 24 }}>
        Viele Grüße,
        <br />
        Dein HSK‑Team
      </p>
    </div>
  );
}
