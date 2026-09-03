import { sendEmail } from "./client";
import type { RolesData } from "@/db/types/role";
import {
  TournamentStartedMail,
  type ParticipantGroupData,
  type TournamentEmailData,
} from "./templates/tournament-started";

export type { TournamentEmailData } from "./templates/tournament-started";

type Props = {
  name: string;
  email: string;
  roles: RolesData;
  tournament: TournamentEmailData;
  participantData?: ParticipantGroupData;
  isGroupUpdate?: boolean;
};

export async function sendTournamentStartedMail(data: Props) {
  await sendEmail({
    to: data.email,
    subject: data.isGroupUpdate
      ? `Deine Gruppe im ${data.tournament.name} wurde geändert`
      : `${data.tournament.name} ist gestartet!`,
    react: TournamentStartedMail({
      name: data.name,
      roles: data.roles,
      tournament: data.tournament,
      participantData: data.participantData,
      isGroupUpdate: data.isGroupUpdate,
    }),
  });
}
