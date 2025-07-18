import { ConfirmRegistrationMail } from "@/email/templates/confirm-registration-mail";
import { resend } from "./client";

export async function sendConfirmRegistrationEmail(
  to: string,
  firstName: string,
) {
  let recipientAddress = to;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }

  await resend.emails.send({
    from: "klubturnier@hsk1830.de",
    to: recipientAddress,
    subject: "Registrierung für das Klubturnier erfolgreich",
    react: ConfirmRegistrationMail({
      name: firstName,
      email: recipientAddress,
    }),
  });
}
