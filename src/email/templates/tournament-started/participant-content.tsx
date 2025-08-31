import * as React from "react";
import { matchDays } from "@/constants/constants";
import { buildGameViewUrl, buildResultsViewUrl } from "@/lib/navigation";
import { ParticipantTable } from "./participant-table";
import { ParticipantGroupData } from "./index";

type Props = {
  tournamentId: number;
  participantGroup: ParticipantGroupData;
};

export function ParticipantContent({ tournamentId, participantGroup }: Props) {
  const gameUrl = buildGameViewUrl({
    tournamentId,
    groupId: participantGroup.groupId,
  });

  const standingsUrl = buildResultsViewUrl({
    tournamentId: tournamentId.toString(),
    groupId: participantGroup.groupId.toString(),
  });

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ color: "#2c3e50", fontSize: "18px", marginBottom: "10px" }}>
        Deine Spielgruppe
      </h2>
      <p>
        Du spielst in der Gruppe <strong>{participantGroup.groupName}</strong>{" "}
        an <strong>{matchDays[participantGroup.dayOfWeek]}en</strong>.
      </p>

      <h3 style={{ fontSize: "16px", marginTop: "15px", marginBottom: "10px" }}>
        Deine Mitspieler:
      </h3>
      <ParticipantTable participants={participantGroup.participants} />

      <p>
        Die Paarungen aller Spieltage findest du unter folgendem Link:
        <br />{" "}
        <a
          href={`https://klubturnier.hsk1830.de${gameUrl}`}
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de{gameUrl}
        </a>
      </p>
      <p>
        Die Rangliste deiner Gruppe findest du unter folgendem Link:
        <br />{" "}
        <a
          href={`https://klubturnier.hsk1830.de${standingsUrl}`}
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de{standingsUrl}
        </a>
      </p>
      <p>
        Dort findest du auch alle weiteren Informationen, kannst Ergebnisse
        eingeben und Partien verlegen. Auch alle anderen Gruppeneinteilungen und
        Paarungen kannst du dort nachlesen.
      </p>
    </div>
  );
}
