import * as React from "react";
import { DayOfWeek } from "@/db/types/group";
import { ParticipantWithProfile } from "@/db/types/participant";
import { matchDays } from "@/constants/constants";
import { buildGameViewUrl } from "@/lib/navigation";
import { ParticipantTable } from "./participant-table";

type Props = {
  tournamentId: number;
  participantGroup: {
    groupName: string;
    dayOfWeek: DayOfWeek;
    groupId: number;
    participants: ParticipantWithProfile[];
  };
};

export function ParticipantContent({ tournamentId, participantGroup }: Props) {
  const gameUrl = buildGameViewUrl({
    tournamentId,
    groupId: participantGroup.groupId,
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
        Dort findest du auch alle weiteren Informationen, kannst Ergebnisse
        eingeben und Partien verlegen. Auch alle anderen Gruppeneinteilungen und
        Paarungen kannst du dort nachlesen.
      </p>
    </div>
  );
}
