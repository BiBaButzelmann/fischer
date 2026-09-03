import * as React from "react";
import type { RolesData } from "@/db/types/role";
import type { DayOfWeek } from "@/db/types/group";
import type { ParticipantWithProfile } from "@/db/types/participant";
import type { Tournament } from "@/db/types/tournament";
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

export type TournamentEmailData = Pick<Tournament, "name" | "slug" | "email">;

type Props = {
  name: string;
  roles: RolesData;
  tournament: TournamentEmailData;
  participantData?: ParticipantGroupData;
  isGroupUpdate?: boolean;
};

export function TournamentStartedMail({
  name,
  roles,
  tournament,
  participantData,
  isGroupUpdate = false,
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

      {isGroupUpdate ? (
        <>
          <p>
            Deine Gruppeneinteilung hat sich geändert. Hier findest du deine
            aktuellen Informationen:
          </p>
        </>
      ) : (
        <>
          <p>
            Das {tournament.name} hat offiziell begonnen. Du kannst dich jetzt
            in das Turniersystem einloggen und deine Partien verfolgen.
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
        </>
      )}

      {roles.participant && (
        <ParticipantContent
          slug={tournament.slug}
          participantGroup={participantData!}
        />
      )}

      {roles.setupHelper && <SetupHelperContent slug={tournament.slug} />}

      {roles.referee && <RefereeContent slug={tournament.slug} />}

      {roles.matchEnteringHelper && <MatchEnteringHelperContent />}

      {roles.juror && <JurorContent />}

      <p>
        Bei Fragen oder Problemen wende Dich gerne an die Turnierleitung unter{" "}
        <a href={`mailto:${tournament.email}`} style={{ color: "#2980b9" }}>
          {tournament.email}
        </a>
      </p>

      <p>
        Viele Grüße,
        <br />
        Die Turnierleitung
        <br />
        {tournament.name}
      </p>
    </div>
  );
}
