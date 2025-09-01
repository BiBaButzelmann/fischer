import { ConfirmRegistrationMail } from "@/email/templates/confirm-registration-mail";
import { sendEmail } from "./client";

export async function sendConfirmRegistrationEmail(
  to: string,
  firstName: string,
) {
  await sendEmail({
    to,
    subject: "Registrierung für das Klubturnier erfolgreich",
    react: ConfirmRegistrationMail({
      name: firstName,
      email: to,
    }),
  });
}
