import { sendEmail } from "./client";
import { RolesData } from "@/db/types/role";
import {
  TournamentStartedMail,
  ParticipantGroupData,
} from "./templates/tournament-started";

type Props = {
  name: string;
  email: string;
  roles: RolesData;
  tournamentId: number;
  participantData?: ParticipantGroupData;
  isGroupUpdate?: boolean;
};

export async function sendTournamentStartedMail(data: Props) {
  await sendEmail({
    to: data.email,
    subject: data.isGroupUpdate ? "Deine Gruppe wurde geändert" : "Das Turnier ist gestartet!",
    react: TournamentStartedMail({
      name: data.name,
      roles: data.roles,
      tournamentId: data.tournamentId,
      participantData: data.participantData,
      isGroupUpdate: data.isGroupUpdate,
    }),
  });
}
