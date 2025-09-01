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
};

export async function sendTournamentStartedMail(data: Props) {
  await sendEmail({
    to: data.email,
    subject: "Das Turnier ist gestartet!",
    react: TournamentStartedMail({
      name: data.name,
      roles: data.roles,
      tournamentId: data.tournamentId,
      participantData: data.participantData,
    }),
  });
}
