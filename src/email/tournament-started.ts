import { resend } from "./client";
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
  let recipientAddress = data.email;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }

  await resend.emails.send({
    from: "klubturnier@hsk1830.de",
    to: recipientAddress,
    subject: "Das Turnier ist gestartet!",
    react: TournamentStartedMail({
      name: data.name,
      roles: data.roles,
      tournamentId: data.tournamentId,
      participantData: data.participantData,
    }),
  });
}
