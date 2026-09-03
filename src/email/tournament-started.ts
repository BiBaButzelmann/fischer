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
  tournament: {
    name: string;
    slug: string;
    email: string;
  };
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
