import { resend } from "./client";
import { PasswordResetMail } from "./templates/password-reset-mail";

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  url: string,
) {
  let recipientAddress = to;
  if (process.env.NODE_ENV === "development") {
    recipientAddress = "delivered@resend.dev";
  }
  await resend.emails.send({
    from: "klubturnier@hsk1830.de",
    to: recipientAddress,
    subject: "Password zurücksetzen",
    react: PasswordResetMail({
      firstName: firstName,
      url: url,
    }),
  });
}
