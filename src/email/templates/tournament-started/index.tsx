import * as React from "react";
import { RolesData } from "@/db/types/role";
import { DayOfWeek } from "@/db/types/group";
import { ParticipantWithProfile } from "@/db/types/participant";
import { ParticipantContent } from "./participant-content";
import { JurorContent } from "./juror-content";
import { MatchEnteringHelperContent } from "./match-entering-helper-content";
import { RefereeContent } from "./referee-content";
import { SetupHelperContent } from "./setup-helper-content";
import invariant from "tiny-invariant";

export type ParticipantGroupData = {
  groupId: number;
  groupName: string;
  dayOfWeek: DayOfWeek;
  participants: ParticipantWithProfile[];
};

type Props = {
  name: string;
  roles: RolesData;
  tournamentId: number;
  participantData: ParticipantGroupData | undefined;
};

export function TournamentStartedMail({
  name,
  roles,
  tournamentId,
  participantData,
}: Props) {
  if (roles.participant) {
    invariant(
      participantData,
      "Participant data must be provided when user has participant role",
    );
  }

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
        Das Klubturnier hat offiziell begonnen. Du kannst dich jetzt in das
        Turniersystem einloggen und deine Partien verfolgen.
      </p>
      <p>Besuche die Turnierwebsite unter folgendem Link:</p>
      <p>
        <a
          href="https://klubturnier.hsk1830.de"
          style={{ color: "#2980b9", fontWeight: "bold" }}
        >
          klubturnier.hsk1830.de
        </a>
      </p>

      {roles.participant && (
        <ParticipantContent
          tournamentId={tournamentId}
          participantGroup={participantData!}
        />
      )}

      {roles.setupHelper && <SetupHelperContent tournamentId={tournamentId} />}

      {roles.referee && <RefereeContent tournamentId={tournamentId} />}

      {roles.matchEnteringHelper && <MatchEnteringHelperContent />}

      {roles.juror && <JurorContent />}

      <p>
        Bei Fragen oder Problemen wende Dich gerne an die Turnierleitung unter{" "}
        <a href="mailto:klubturnier@hsk1830.de" style={{ color: "#2980b9" }}>
          klubturnier@hsk1830.de
        </a>
      </p>

      <p>
        Viele Grüße,
        <br />
        Die Turnierleitung <br />
        Arne Alpers, Arend Bothe und Kai Müller
      </p>
    </div>
  );
}
