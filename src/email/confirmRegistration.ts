import { RegistrationMail } from "@/email/templates/registration-mail";
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
    from: "noreply@hsk1830.de",
    to: recipientAddress,
    subject: "Bla bla bla",
    react: RegistrationMail({
      firstName: firstName,
      email: recipientAddress,
    }),
  });
}
