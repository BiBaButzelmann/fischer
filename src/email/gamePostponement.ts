import { GamePostponementMail } from "@/email/templates/game-postponement-mail";
import { sendEmail } from "./client";

type GamePostponementEmailData = {
  playerEmail: string;
  playerName: string;
  opponentName: string;
  postponingPlayerName: string;
  gameDetails: {
    round: number;
    groupName: string;
  };
  oldDate: string;
  newDate: string;
  contactInfo: {
    opponentEmail: string;
    opponentPhone: string;
  };
};

export async function sendGamePostponementEmail(
  data: GamePostponementEmailData,
) {
  const isPlayerPostponing = data.playerName === data.postponingPlayerName;
  const subject = isPlayerPostponing
    ? "Partie erfolgreich verschoben"
    : "Deine Partie wurde verschoben";

  await sendEmail({
    to: data.playerEmail,
    subject: subject,
    react: GamePostponementMail({
      playerName: data.playerName,
      opponentName: data.opponentName,
      postponingPlayerName: data.postponingPlayerName,
      gameDetails: data.gameDetails,
      oldDate: data.oldDate,
      newDate: data.newDate,
      contactInfo: data.contactInfo,
    }),
  });
}

export async function sendGamePostponementNotifications(
  whitePlayerData: GamePostponementEmailData,
  blackPlayerData: GamePostponementEmailData,
) {
  await sendGamePostponementEmail(whitePlayerData);

  await sendGamePostponementEmail(blackPlayerData);
}
